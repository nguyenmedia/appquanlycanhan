import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let cachedMaintenance: { enabled: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 2500; // 2.5s cache for fast edge/server performance

async function getMaintenanceStatus(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance && now - cachedMaintenance.timestamp < CACHE_TTL_MS) {
    return cachedMaintenance.enabled;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/system_settings?key=eq.maintenance_mode&select=value`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const enabled = data?.[0]?.value === "true";
      cachedMaintenance = { enabled, timestamp: now };
      return enabled;
    }
  } catch (err) {
    console.warn("[Proxy] Maintenance check error:", err);
  }

  return cachedMaintenance?.enabled ?? false;
}

function getUserRoleFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    return payload.role || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Always allow static files, Next internals, icons, and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/og-image.png"
  ) {
    return NextResponse.next();
  }

  // 2. Always allow Maintenance Notice page itself
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  // 3. Always allow Maintenance status API (so client can poll status)
  if (pathname.startsWith("/api/maintenance")) {
    return NextResponse.next();
  }

  // 4. Always allow Login & Auth APIs so Admin can authenticate
  if (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/me"
  ) {
    return NextResponse.next();
  }

  // 5. Always allow Admin routes & Admin APIs (Admin layout/API handles admin role auth)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // 6. Check if Maintenance Mode is active
  const isMaintenance = await getMaintenanceStatus();

  if (isMaintenance) {
    // Check if current user has an Admin token
    const token =
      request.cookies.get("lifeos_token")?.value ||
      (request.headers.get("Authorization")?.startsWith("Bearer ")
        ? request.headers.get("Authorization")!.substring(7)
        : undefined);

    const role = getUserRoleFromToken(token);
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    if (!isAdmin) {
      // If it's an API route, return 503 JSON
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error: "Hệ thống đang bảo trì",
            maintenance: true,
            message: "LifeOS đang trong thời gian bảo trì nâng cấp. Vui lòng quay lại sau ít phút.",
          },
          { status: 503 }
        );
      }

      // If it's a page route, redirect to /maintenance
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  return NextResponse.next();
}

// Support for backward compatibility if Next looks for default or middleware
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
