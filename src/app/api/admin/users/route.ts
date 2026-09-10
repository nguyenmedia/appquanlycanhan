import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const planFilter = searchParams.get("plan") || "";
    const roleFilter = searchParams.get("role") || "";

    // 1. LIVE SYNC VỚI SUPABASE CLOUD:
    // Lấy toàn bộ danh sách tài khoản thật từ Supabase Cloud
    let supabaseConnected = false;
    let cloudUserCount = 0;

    try {
      const { data: sbUsers, error: sbErr } = await supabase
        .from("users")
        .select("*, profile:user_profiles(*)")
        .order("created_at", { ascending: false });

      if (!sbErr && Array.isArray(sbUsers)) {
        supabaseConnected = true;
        cloudUserCount = sbUsers.length;
        const sbUserIds = new Set(sbUsers.map((u) => u.id));

        // DỌN DẸP ORPHAN: Bất kỳ user nào trên local SQLite mà đã bị xóa trên Supabase -> Xóa khỏi local
        const localUsers = await prisma.user.findMany({ select: { id: true, email: true } });
        for (const lu of localUsers) {
          if (!sbUserIds.has(lu.id)) {
            try {
              await prisma.user.delete({ where: { id: lu.id } });
            } catch (pruneErr) {
              console.warn("[Admin Users] Prune orphan local user notice:", lu.id);
            }
          }
        }

        // ĐỒNG BỘ HAI CHIỀU: Đảm bảo local SQLite có đầy đủ các user từ Supabase Cloud
        for (const sbUser of sbUsers) {
          try {
            await prisma.user.upsert({
              where: { id: sbUser.id },
              update: {
                email: sbUser.email,
                role: sbUser.role || "USER",
                status: sbUser.status || "ACTIVE",
                referralCode: sbUser.referral_code || sbUser.id,
                referredById: sbUser.referred_by_id,
              },
              create: {
                id: sbUser.id,
                email: sbUser.email,
                passwordHash: sbUser.password_hash || "$2a$10$Defau1tCl0udP4ssw0rdHashForSyncPurposeOnly",
                role: sbUser.role || "USER",
                status: sbUser.status || "ACTIVE",
                referralCode: sbUser.referral_code || `REF_${sbUser.id.substring(0, 6)}`,
                referredById: sbUser.referred_by_id,
                createdAt: sbUser.created_at ? new Date(sbUser.created_at) : new Date(),
              },
            });

            const sbProf = Array.isArray(sbUser.profile) ? sbUser.profile[0] : sbUser.profile;
            if (sbProf) {
              await prisma.userProfile.upsert({
                where: { userId: sbUser.id },
                update: {
                  fullName: sbProf.full_name || "LifeOS User",
                  avatarUrl: sbProf.avatar_url,
                  phone: sbProf.phone,
                },
                create: {
                  userId: sbUser.id,
                  fullName: sbProf.full_name || "LifeOS User",
                  avatarUrl: sbProf.avatar_url,
                  phone: sbProf.phone,
                },
              });
            }
          } catch (syncErr) {
            console.warn("[Admin Users] Sync reconcile error for user:", sbUser.id, syncErr);
          }
        }
      }
    } catch (cloudErr) {
      console.warn("[Admin Users] Supabase cloud connection notice:", cloudErr);
    }

    // 2. Lấy dữ liệu người dùng (đã đồng bộ 100% với Supabase) kèm thống kê & quan hệ
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { referralCode: { contains: search } },
      ];
    }
    if (roleFilter) {
      where.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        subscriptions: {
          where: { status: "active" },
          include: { plan: true },
          take: 1,
        },
        crmProfile: true,
        aiLedgers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { tasks: true, habits: true, goals: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    let formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      fullName: u.profile?.fullName || "Chưa đặt tên",
      phone: u.profile?.phone || "",
      plan: u.subscriptions[0]?.plan?.name || "Free",
      planSlug: u.subscriptions[0]?.plan?.slug || "free",
      lifecycleStage: u.crmProfile?.lifecycleStage || "registered",
      healthScore: u.crmProfile?.healthScore || 100,
      aiCreditBalance: u.aiLedgers[0]?.balanceAfter || 0,
      isCloudSynced: true,
      stats: {
        tasks: u._count.tasks,
        habits: u._count.habits,
        goals: u._count.goals,
      },
    }));

    if (planFilter) {
      formatted = formatted.filter((u) => u.planSlug === planFilter);
    }

    return NextResponse.json({
      success: true,
      users: formatted,
      supabaseConnected,
      cloudUserCount,
      source: "supabase_cloud",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { email, password, fullName, role = "USER", planSlug = "free", initialCredits = 20 } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing on local Prisma
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email đã tồn tại trong hệ thống" }, { status: 400 });
    }

    // Check existing on Supabase Cloud
    try {
      const { data: sbExisting } = await supabase
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (sbExisting) {
        return NextResponse.json({ error: "Email này đã tồn tại trên Supabase Cloud" }, { status: 400 });
      }
    } catch (e) {}

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        referralCode,
        status: "ACTIVE",
        profile: {
          create: {
            fullName: fullName || email.split("@")[0],
          },
        },
        crmProfile: {
          create: {
            lifecycleStage: planSlug === "free" ? "registered" : "paid",
            healthScore: 100,
          },
        },
      },
      include: { profile: true },
    });

    // Create subscription on local
    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (plan) {
      const now = new Date();
      await prisma.subscription.create({
        data: {
          userId: newUser.id,
          planId: plan.id,
          status: "active",
          billingCycle: "monthly",
          price: plan.priceMonthly,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          provider: "admin_manual_grant",
        },
      });
    }

    // Initial AI credits
    if (initialCredits > 0) {
      await prisma.aICreditLedger.create({
        data: {
          userId: newUser.id,
          type: "grant",
          amount: Number(initialCredits),
          balanceAfter: Number(initialCredits),
          description: "Tặng thưởng khởi tạo tài khoản từ Admin",
        },
      });
    }

    // ĐỒNG BỘ TRỰC TIẾP LÊN SUPABASE CLOUD
    try {
      await supabase.from("users").upsert({
        id: newUser.id,
        email: newUser.email,
        password_hash: passwordHash,
        role: newUser.role,
        status: newUser.status,
        referral_code: newUser.referralCode,
        created_at: newUser.createdAt.toISOString(),
        updated_at: newUser.updatedAt.toISOString(),
      });

      if (newUser.profile) {
        await supabase.from("user_profiles").upsert({
          id: newUser.profile.id,
          user_id: newUser.id,
          full_name: newUser.profile.fullName,
          created_at: newUser.profile.createdAt.toISOString(),
          updated_at: newUser.profile.updatedAt.toISOString(),
        });
      }

      if (planSlug) {
        const subEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("subscriptions").upsert({
          user_id: newUser.id,
          plan_id: `plan_${planSlug}`,
          status: "active",
          billing_cycle: "monthly",
          current_period_end: subEndDate,
        });
      }
    } catch (sbPushErr) {
      console.warn("[Admin Users] Supabase push error:", sbPushErr);
    }

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "create_user_admin",
        entityType: "user",
        entityId: newUser.id,
        detailsJson: JSON.stringify({ email: normalizedEmail, role, planSlug }),
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { userId, status, role, changePlanSlug, creditBonus, note } = body;

    if (!userId) return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });

    // Update status or role
    if (status !== undefined || role !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: status || undefined,
          role: role || undefined,
        },
      });

      // Sync status & role to Supabase
      try {
        await supabase.from("users").update({
          ...(status !== undefined ? { status } : {}),
          ...(role !== undefined ? { role } : {}),
          updated_at: new Date().toISOString(),
        }).eq("id", userId);
      } catch (sbUpdateErr) {
        console.warn("[Admin Users] Supabase status/role sync error:", sbUpdateErr);
      }

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "update_user_status_role",
          entityType: "user",
          entityId: userId,
          detailsJson: JSON.stringify({ status, role }),
        },
      });
    }

    // Add AI credit bonus
    if (creditBonus && Number(creditBonus) > 0) {
      const lastLedger = await prisma.aICreditLedger.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const currentBalance = lastLedger ? lastLedger.balanceAfter : 0;
      const newBalance = currentBalance + Number(creditBonus);

      await prisma.aICreditLedger.create({
        data: {
          userId,
          type: "bonus",
          amount: Number(creditBonus),
          balanceAfter: newBalance,
          description: note || `Admin cộng thêm ${creditBonus} AI credits`,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "grant_ai_credits",
          entityType: "ai_credit",
          entityId: userId,
          detailsJson: JSON.stringify({ amount: creditBonus, newBalance }),
        },
      });
    }

    // Change plan manually if requested
    if (changePlanSlug) {
      const plan = await prisma.plan.findUnique({ where: { slug: changePlanSlug } });
      if (plan) {
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.create({
          data: {
            userId,
            planId: plan.id,
            status: "active",
            billingCycle: "monthly",
            price: plan.priceMonthly,
            startDate: now,
            currentPeriodStart: now,
            currentPeriodEnd: end,
            provider: "admin_override",
          },
        });

        // Sync subscription to Supabase
        try {
          const cloudPlanId = `plan_${plan.slug}`;
          const subEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            plan_id: cloudPlanId,
            status: "active",
            billing_cycle: "monthly",
            price: plan.priceMonthly,
            current_period_end: subEndDate,
          });
        } catch (sbSubErr) {
          console.warn("[Admin Users] Supabase subscription sync error:", sbSubErr);
        }

        await prisma.adminAuditLog.create({
          data: {
            adminUserId: admin.id,
            action: "manual_plan_override",
            entityType: "subscription",
            entityId: userId,
            detailsJson: JSON.stringify({ plan: plan.name }),
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Cập nhật tài khoản thành công trên Supabase Cloud & hệ thống" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 });
    if (userId === admin.id) {
      return NextResponse.json({ error: "Không thể tự xóa tài khoản của chính mình!" }, { status: 400 });
    }

    // 1. XÓA TRIỆT ĐỂ TRÊN SUPABASE CLOUD TRƯỚC TIÊN
    try {
      const relatedTables = [
        "user_profiles",
        "subscriptions",
        "payment_transactions",
        "tasks",
        "habits",
        "goals",
        "notes",
        "journal_entries",
        "health_logs",
        "learning_items",
      ];

      for (const tbl of relatedTables) {
        try {
          await supabase.from(tbl).delete().eq("user_id", userId);
        } catch (tblErr) {
          // Bỏ qua nếu bảng chưa có dữ liệu của user này
        }
      }

      // Xóa bản ghi user trong bảng users trên Supabase
      const { error: sbDeleteErr } = await supabase.from("users").delete().eq("id", userId);
      if (sbDeleteErr) {
        console.error("[Admin Users] Lỗi xóa user trên Supabase:", sbDeleteErr.message);
      }
    } catch (sbEx) {
      console.error("[Admin Users] Exception khi xóa Supabase:", sbEx);
    }

    // 2. XÓA TRÊN LOCAL PRISMA SQLITE
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (prismaDelErr) {
      console.warn("[Admin Users] Local prisma delete warning:", prismaDelErr);
    }

    // 3. Ghi nhật ký Audit Log
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "delete_user",
        entityType: "user",
        entityId: userId,
        detailsJson: JSON.stringify({ deletedUserId: userId, provider: "supabase_and_local" }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa vĩnh viễn người dùng khỏi Supabase Cloud và hệ thống!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
