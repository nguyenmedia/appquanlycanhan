import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lifeos.vn";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/login", "/register", "/support", "/refer", "/onboarding"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin",
          "/api/admin/*",
          "/settings",
          "/settings/*",
          "/api/auth/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
