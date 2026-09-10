import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

let cachedStatus: { enabled: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 3000; // 3 seconds cache to balance performance & real-time response

/**
 * Kiểm tra xem hệ thống có đang trong Chế độ bảo trì (Maintenance Mode) hay không
 */
export async function isMaintenanceModeEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cachedStatus && now - cachedStatus.timestamp < CACHE_TTL_MS) {
    return cachedStatus.enabled;
  }

  let enabled = false;

  // 1. Thử truy vấn từ Prisma Local SQLite / Postgres
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode" },
    });
    if (setting) {
      enabled = setting.value === "true";
      cachedStatus = { enabled, timestamp: now };
      return enabled;
    }
  } catch (err) {
    console.warn("[Maintenance] Prisma read error, falling back to Supabase:", err);
  }

  // 2. Fallback sang Supabase Cloud (cho Vercel Serverless / multi-instance)
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (!error && data) {
      enabled = data.value === "true";
    }
  } catch (sbErr) {
    console.warn("[Maintenance] Supabase read error:", sbErr);
  }

  cachedStatus = { enabled, timestamp: now };
  return enabled;
}

/**
 * Bật hoặc tắt Chế độ bảo trì hệ thống
 * Đồng bộ ngay lập tức cả Prisma và Supabase Cloud
 */
export async function setMaintenanceMode(enabled: boolean, adminUserId?: string) {
  const strVal = enabled ? "true" : "false";

  // 1. Lưu vào Prisma Local
  try {
    await prisma.systemSetting.upsert({
      where: { key: "maintenance_mode" },
      update: { value: strVal },
      create: {
        key: "maintenance_mode",
        value: strVal,
        description: "Chế độ bảo trì hệ thống (Chỉ Admin mới có thể truy cập)",
      },
    });
  } catch (err) {
    console.warn("[Maintenance] Prisma upsert error:", err);
  }

  // 2. Đồng bộ lên Supabase Cloud
  try {
    await supabase.from("system_settings").upsert(
      {
        key: "maintenance_mode",
        value: strVal,
        description: "Chế độ bảo trì hệ thống (Chỉ Admin mới có thể truy cập)",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (sbErr) {
    console.warn("[Maintenance] Supabase upsert error:", sbErr);
  }

  // Cập nhật bộ nhớ đệm ngay lập tức
  cachedStatus = { enabled, timestamp: Date.now() };
  return { success: true, enabled };
}
