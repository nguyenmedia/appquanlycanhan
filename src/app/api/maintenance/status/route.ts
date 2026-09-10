import { NextRequest, NextResponse } from "next/server";
import { isMaintenanceModeEnabled, setMaintenanceMode } from "@/lib/maintenance";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const enabled = await isMaintenanceModeEnabled();
    const user = await getCurrentUser(req);
    const isMaintenanceAdmin = user ? ["ADMIN", "SUPER_ADMIN"].includes(user.role) : false;

    return NextResponse.json({
      success: true,
      maintenance: enabled,
      isMaintenanceAdmin,
      role: user?.role || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, maintenance: false },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Giá trị enabled phải là boolean (true/false)" },
        { status: 400 }
      );
    }

    await setMaintenanceMode(enabled, admin.id);

    return NextResponse.json({
      success: true,
      maintenance: enabled,
      message: enabled
        ? "Đã kích hoạt Chế độ bảo trì hệ thống (Chỉ Admin mới có quyền truy cập)"
        : "Đã tắt Chế độ bảo trì hệ thống (Tất cả người dùng có thể truy cập bình thường)",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
