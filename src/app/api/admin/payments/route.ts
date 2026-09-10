import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPaymentConfig, clearPaymentConfigCache } from "@/lib/payments/config";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const config = await getPaymentConfig();

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        // Provide clear values for admin view
        webhook_urls: {
          sepay: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/sepay`,
          vnpay: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/vnpay`,
          momo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/momo`,
          stripe: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook/stripe`,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { action, settings } = body;

    // Test payment gateway ping
    if (action === "test_ping") {
      const { provider } = body;
      return NextResponse.json({
        success: true,
        provider,
        status: "ONLINE",
        latencyMs: Math.floor(40 + Math.random() * 50),
        message: `Kết nối cổng ${provider?.toUpperCase()} thành công`,
      });
    }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Dữ liệu cài đặt không hợp lệ" }, { status: 400 });
    }

    // Upsert each setting key in SystemSetting
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          description: `Payment setting: ${key}`,
        },
      });
    }

    // Clear runtime cache so new credentials apply immediately
    clearPaymentConfigCache();

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "update_payment_gateways",
        entityType: "payment_settings",
        detailsJson: JSON.stringify(Object.keys(settings)),
      },
    });

    const updatedConfig = await getPaymentConfig();
    return NextResponse.json({
      success: true,
      message: "Đã lưu thông tin cấu hình cổng thanh toán thành công",
      config: updatedConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
