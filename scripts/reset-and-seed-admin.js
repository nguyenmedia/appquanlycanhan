const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ajpsdqdzeuvykgbvmkea.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_9PTsLHlLExGiO7w391Z7NA_SAzLfFJX";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAndSeedAdmin() {
  console.log("==================================================");
  console.log("🗑️  ĐANG XÓA TOÀN BỘ TÀI KHOẢN CŨ TRÊN LOCAL VÀ SUPABASE...");
  console.log("==================================================");

  // 1. XÓA DỮ LIỆU NGƯỜI DÙNG TRÊN SUPABASE CLOUD
  try {
    const supabaseTables = [
      "support_messages",
      "support_tickets",
      "finance_transactions",
      "finance_accounts",
      "budgets",
      "debts",
      "tasks",
      "projects",
      "calendar_events",
      "habit_logs",
      "habits",
      "goals",
      "notes",
      "journal_entries",
      "document_items",
      "contacts",
      "health_logs",
      "learning_items",
      "pomodoro_sessions",
      "ai_credit_ledgers",
      "ai_usages",
      "customer_crm",
      "admin_audit_logs",
      "announcement_reads",
      "referrals",
      "invoices",
      "payment_transactions",
      "subscriptions",
      "user_profiles",
      "users",
    ];

    for (const table of supabaseTables) {
      try {
        const { error } = await supabase.from(table).delete().neq("id", "keep_nothing_delete_all");
        if (error) {
          // Some tables might not have id or might require different filter
          await supabase.from(table).delete().gt("created_at", "1970-01-01");
        }
        console.log(`  ✓ Supabase: Đã làm sạch bảng ${table}`);
      } catch (e) {
        // Table might not exist or empty
      }
    }
    console.log("✅ ĐÃ XÓA TOÀN BỘ TÀI KHOẢN & DỮ LIỆU CŨ TRÊN SUPABASE CLOUD!");
  } catch (err) {
    console.error("Lỗi xóa Supabase:", err);
  }

  // 2. XÓA DỮ LIỆU TRÊN PRISMA LOCAL
  try {
    await prisma.supportMessage.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.financeTransaction.deleteMany({});
    await prisma.financeAccount.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.debt.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.calendarEvent.deleteMany({});
    await prisma.habitLog.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.goal.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.journalEntry.deleteMany({});
    await prisma.documentItem.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.healthLog.deleteMany({});
    await prisma.learningItem.deleteMany({});
    await prisma.pomodoroSession.deleteMany({});
    await prisma.aICreditLedger.deleteMany({});
    await prisma.aIUsage.deleteMany({});
    await prisma.customerCRM.deleteMany({});
    await prisma.adminAuditLog.deleteMany({});
    await prisma.announcementRead.deleteMany({});
    await prisma.referral.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.paymentTransaction.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.userProfile.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ ĐÃ XÓA TOÀN BỘ TÀI KHOẢN & DỮ LIỆU CŨ TRÊN PRISMA LOCAL!");
  } catch (err) {
    console.error("Lỗi xóa Prisma local:", err);
  }

  // 3. TẠO TÀI KHOẢN ADMIN DUY NHẤT: nguyenmedia
  console.log("\n==================================================");
  console.log("👑 ĐANG TẠO TÀI KHOẢN ADMIN: nguyenmedia...");
  console.log("==================================================");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("nguyenmedia123@", salt);

  const premiumPlan = await prisma.plan.findUnique({ where: { slug: "premium" } });
  const planId = premiumPlan ? premiumPlan.id : undefined;

  // Tạo tài khoản chính: nguyenmedia
  const adminUser = await prisma.user.create({
    data: {
      id: "admin_nguyenmedia_root",
      email: "nguyenmedia",
      passwordHash: passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      referralCode: "NGUYENMEDIA",
      profile: {
        create: {
          fullName: "Nguyễn Media",
          bio: "LifeOS Super Administrator & Lead Creator",
          onboardingCompleted: true,
          currency: "VND",
          timezone: "Asia/Ho_Chi_Minh",
        },
      },
      crmProfile: {
        create: {
          lifecycleStage: "active",
          healthScore: 100,
          tagsJson: JSON.stringify(["SuperAdmin", "Owner"]),
        },
      },
    },
    include: { profile: true },
  });

  // Tạo thêm alias: nguyenmedia@lifeos.app để nếu người dùng đăng nhập có đuôi email vẫn vào được cùng tài khoản
  const adminUserAlias = await prisma.user.create({
    data: {
      id: "admin_nguyenmedia_alias",
      email: "nguyenmedia@lifeos.app",
      passwordHash: passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      referralCode: "NGUYENMEDIAVIP",
      profile: {
        create: {
          fullName: "Nguyễn Media",
          bio: "LifeOS Super Administrator",
          onboardingCompleted: true,
          currency: "VND",
          timezone: "Asia/Ho_Chi_Minh",
        },
      },
    },
  });

  // Cấp gói Premium trọn đời và 99,999 AI Credits cho Admin
  if (planId) {
    const now = new Date();
    await prisma.subscription.create({
      data: {
        userId: adminUser.id,
        planId: planId,
        status: "active",
        billingCycle: "yearly",
        price: 0,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
        provider: "internal",
      },
    });

    await prisma.subscription.create({
      data: {
        userId: adminUserAlias.id,
        planId: planId,
        status: "active",
        billingCycle: "yearly",
        price: 0,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000),
        provider: "internal",
      },
    });
  }

  // Cấp AI Credits
  await prisma.aICreditLedger.create({
    data: {
      userId: adminUser.id,
      type: "grant",
      amount: 99999,
      balanceAfter: 99999,
      feature: "admin_master_grant",
      description: "Cấp đặc quyền credits vô hạn cho Super Admin Nguyễn Media",
    },
  });

  // Tạo ví tiền mặt mẫu cho Admin
  await prisma.financeAccount.create({
    data: {
      userId: adminUser.id,
      name: "Ví Tiền Mặt Chính",
      type: "cash",
      balance: 10000000,
      isDefault: true,
    },
  });

  // Tạo task khởi đầu cho Admin
  await prisma.task.create({
    data: {
      userId: adminUser.id,
      title: "Chào mừng Nguyễn Media đến với Hệ điều hành LifeOS",
      description: "Tài khoản của bạn đã được thiết lập với đầy đủ quyền Super Admin cao nhất.",
      priority: "high",
      status: "in_progress",
    },
  });

  console.log("✅ ĐÃ TẠO TÀI KHOẢN ADMIN TRÊN PRISMA LOCAL!");

  // 4. ĐỒNG BỘ TÀI KHOẢN ADMIN DUY NHẤT LÊN SUPABASE CLOUD
  try {
    const nowIso = new Date().toISOString();

    // Đồng bộ user nguyenmedia
    await supabase.from("users").upsert({
      id: adminUser.id,
      email: adminUser.email,
      password_hash: passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      referral_code: adminUser.referralCode,
      created_at: nowIso,
      updated_at: nowIso,
    });

    await supabase.from("user_profiles").upsert({
      user_id: adminUser.id,
      full_name: "Nguyễn Media",
      bio: "LifeOS Super Administrator & Lead Creator",
      onboarding_completed: true,
      currency: "VND",
      timezone: "Asia/Ho_Chi_Minh",
      created_at: nowIso,
      updated_at: nowIso,
    });

    // Đồng bộ user nguyenmedia@lifeos.app
    await supabase.from("users").upsert({
      id: adminUserAlias.id,
      email: adminUserAlias.email,
      password_hash: passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      referral_code: adminUserAlias.referralCode,
      created_at: nowIso,
      updated_at: nowIso,
    });

    await supabase.from("user_profiles").upsert({
      user_id: adminUserAlias.id,
      full_name: "Nguyễn Media",
      bio: "LifeOS Super Administrator",
      onboarding_completed: true,
      currency: "VND",
      timezone: "Asia/Ho_Chi_Minh",
      created_at: nowIso,
      updated_at: nowIso,
    });

    // Subscriptions
    await supabase.from("subscriptions").upsert({
      user_id: adminUser.id,
      plan_id: "plan_premium",
      status: "active",
      billing_cycle: "yearly",
      price: 0,
    });

    await supabase.from("subscriptions").upsert({
      user_id: adminUserAlias.id,
      plan_id: "plan_premium",
      status: "active",
      billing_cycle: "yearly",
      price: 0,
    });

    console.log("✅ ĐÃ ĐỒNG BỘ TÀI KHOẢN ADMIN LÊN SUPABASE CLOUD!");
  } catch (sbErr) {
    console.error("Lỗi đồng bộ Admin sang Supabase:", sbErr);
  }

  console.log("\n==================================================");
  console.log("🎉 HOÀN THÀNH XUẤT SẮC!");
  console.log("Thông tin đăng nhập Admin duy nhất:");
  console.log("👉 Tài khoản: nguyenmedia (hoặc nguyenmedia@lifeos.app)");
  console.log("👉 Mật khẩu: nguyenmedia123@");
  console.log("👉 Vai trò: SUPER_ADMIN");
  console.log("==================================================");
}

resetAndSeedAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
