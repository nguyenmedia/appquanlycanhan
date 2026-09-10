import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { syncCoreAdminData } from "@/lib/sync/supabase-sync";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);

    // Đồng bộ thời gian thực hai chiều với Supabase Cloud
    await syncCoreAdminData().catch((e) => console.warn("[CRM] Sync warning:", e));

    const customers = await prisma.customerCRM.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            profile: { select: { fullName: true, phone: true } },
            subscriptions: {
              where: { status: "active" },
              include: { plan: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { lastActivityAt: "desc" },
    });

    const pipeline = {
      lead: customers.filter((c) => c.lifecycleStage === "lead"),
      registered: customers.filter((c) => c.lifecycleStage === "registered"),
      trial: customers.filter((c) => c.lifecycleStage === "trial"),
      paid: customers.filter((c) => c.lifecycleStage === "paid"),
      active: customers.filter((c) => c.lifecycleStage === "active"),
      at_risk: customers.filter((c) => c.lifecycleStage === "at_risk"),
      churned: customers.filter((c) => c.lifecycleStage === "churned"),
    };

    return NextResponse.json({ success: true, pipeline, total: customers.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const body = await req.json();
    const { userId, lifecycleStage, healthScore, internalNotes, tags } = body;

    if (!userId) return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 });

    const updated = await prisma.customerCRM.upsert({
      where: { userId },
      update: {
        lifecycleStage: lifecycleStage || undefined,
        healthScore: healthScore !== undefined ? Number(healthScore) : undefined,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
        tagsJson: tags ? JSON.stringify(tags) : undefined,
      },
      create: {
        userId,
        lifecycleStage: lifecycleStage || "registered",
        healthScore: healthScore !== undefined ? Number(healthScore) : 100,
        internalNotes,
        tagsJson: tags ? JSON.stringify(tags) : null,
      },
    });

    // Đẩy ngay lập tức lên Supabase Cloud
    try {
      await supabase.from("customer_crm").upsert({
        id: updated.id,
        user_id: updated.userId,
        lifecycle_stage: updated.lifecycleStage,
        health_score: updated.healthScore,
        tags_json: updated.tagsJson,
        last_activity_at: updated.lastActivityAt ? new Date(updated.lastActivityAt).toISOString() : new Date().toISOString(),
        internal_notes: updated.internalNotes,
        assigned_to: updated.assignedTo,
        updated_at: new Date().toISOString(),
      });
    } catch (sbErr) {
      console.warn("[CRM PATCH] Supabase cloud push notice:", sbErr);
    }

    return NextResponse.json({ success: true, crm: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
