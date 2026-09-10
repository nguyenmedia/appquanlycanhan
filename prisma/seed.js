const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding LifeOS SaaS database...");

  // 1. System Settings
  const settings = [
    { key: "app_name", value: "LifeOS", description: "Tên ứng dụng SaaS" },
    { key: "app_tagline", value: "Everything for your life, organized in one place.", description: "Khẩu hiệu" },
    { key: "support_email", value: "support@lifeos.app", description: "Email hỗ trợ khách hàng" },
    { key: "currency", value: "VND", description: "Đơn vị tiền tệ chính" },
    { key: "default_plan", value: "free", description: "Gói mặc định khi đăng ký" },
    { key: "trial_days", value: "14", description: "Số ngày dùng thử Pro (nếu bật)" },
    { key: "trial_enabled", value: "true", description: "Bật chế độ dùng thử Pro" },
    { key: "maintenance_mode", value: "false", description: "Chế độ bảo trì hệ thống" },
    { key: "registration_enabled", value: "true", description: "Cho phép đăng ký mới" },
    { key: "referral_enabled", value: "true", description: "Bật chương trình giới thiệu bạn bè" },
    { key: "coupon_enabled", value: "true", description: "Bật tính năng mã giảm giá" },
    { key: "pwa_enabled", value: "true", description: "Bật Progressive Web App" },
    { key: "ai_provider", value: "openai", description: "Nhà cung cấp AI mặc định" },
    { key: "ai_chat_cost", value: "1", description: "Số credit cho AI Chat" },
    { key: "ai_planner_cost", value: "3", description: "Số credit cho AI Task Planning" },
    { key: "ai_review_cost", value: "5", description: "Số credit cho AI Weekly Review" },
    { key: "ai_finance_cost", value: "5", description: "Số credit cho AI Finance Analysis" },
    { key: "ai_coach_cost", value: "10", description: "Số credit cho AI Life Coach" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // 2. Pricing Plans (Free, Pro, Premium)
  // Clean existing features/limits if needed
  const freePlan = await prisma.plan.upsert({
    where: { slug: "free" },
    update: {
      name: "Free",
      description: "Quản lý cuộc sống cơ bản, miễn phí trọn đời cho cá nhân.",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "VND",
      isPopular: false,
      isActive: true,
      isPublic: true,
      sortOrder: 1,
    },
    create: {
      name: "Free",
      slug: "free",
      description: "Quản lý cuộc sống cơ bản, miễn phí trọn đời cho cá nhân.",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "VND",
      isPopular: false,
      isActive: true,
      isPublic: true,
      sortOrder: 1,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {
      name: "LifeOS Pro",
      description: "Dành cho người năng suất cao, không giới hạn công việc & dự án.",
      priceMonthly: 199000,
      priceYearly: 1990000,
      currency: "VND",
      isPopular: true,
      isActive: true,
      isPublic: true,
      sortOrder: 2,
    },
    create: {
      name: "LifeOS Pro",
      slug: "pro",
      description: "Dành cho người năng suất cao, không giới hạn công việc & dự án.",
      priceMonthly: 199000,
      priceYearly: 1990000,
      currency: "VND",
      isPopular: true,
      isActive: true,
      isPublic: true,
      sortOrder: 2,
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { slug: "premium" },
    update: {
      name: "LifeOS Premium",
      description: "Trải nghiệm đỉnh cao với AI Life Coach, tự động hóa và hỗ trợ VIP.",
      priceMonthly: 499000,
      priceYearly: 4990000,
      currency: "VND",
      isPopular: false,
      isActive: true,
      isPublic: true,
      sortOrder: 3,
    },
    create: {
      name: "LifeOS Premium",
      slug: "premium",
      description: "Trải nghiệm đỉnh cao với AI Life Coach, tự động hóa và hỗ trợ VIP.",
      priceMonthly: 499000,
      priceYearly: 4990000,
      currency: "VND",
      isPopular: false,
      isActive: true,
      isPublic: true,
      sortOrder: 3,
    },
  });

  // Setup Plan Features
  const features = [
    // Free features
    { planId: freePlan.id, key: "dashboard", enabled: true },
    { planId: freePlan.id, key: "tasks", enabled: true },
    { planId: freePlan.id, key: "projects", enabled: true },
    { planId: freePlan.id, key: "calendar", enabled: true },
    { planId: freePlan.id, key: "habits", enabled: true },
    { planId: freePlan.id, key: "goals", enabled: true },
    { planId: freePlan.id, key: "notes", enabled: true },
    { planId: freePlan.id, key: "basic_finance", enabled: true },
    { planId: freePlan.id, key: "basic_analytics", enabled: true },
    { planId: freePlan.id, key: "ai_assistant", enabled: true },
    { planId: freePlan.id, key: "ai_planner", enabled: false },
    { planId: freePlan.id, key: "ai_life_coach", enabled: false },
    { planId: freePlan.id, key: "advanced_finance", enabled: false },
    { planId: freePlan.id, key: "export_data", enabled: false },
    { planId: freePlan.id, key: "priority_support", enabled: false },

    // Pro features
    { planId: proPlan.id, key: "dashboard", enabled: true },
    { planId: proPlan.id, key: "tasks", enabled: true },
    { planId: proPlan.id, key: "projects", enabled: true },
    { planId: proPlan.id, key: "calendar", enabled: true },
    { planId: proPlan.id, key: "habits", enabled: true },
    { planId: proPlan.id, key: "goals", enabled: true },
    { planId: proPlan.id, key: "notes", enabled: true },
    { planId: proPlan.id, key: "basic_finance", enabled: true },
    { planId: proPlan.id, key: "basic_analytics", enabled: true },
    { planId: proPlan.id, key: "ai_assistant", enabled: true },
    { planId: proPlan.id, key: "ai_planner", enabled: true },
    { planId: proPlan.id, key: "ai_life_coach", enabled: false },
    { planId: proPlan.id, key: "advanced_finance", enabled: true },
    { planId: proPlan.id, key: "export_data", enabled: true },
    { planId: proPlan.id, key: "priority_support", enabled: true },

    // Premium features
    { planId: premiumPlan.id, key: "dashboard", enabled: true },
    { planId: premiumPlan.id, key: "tasks", enabled: true },
    { planId: premiumPlan.id, key: "projects", enabled: true },
    { planId: premiumPlan.id, key: "calendar", enabled: true },
    { planId: premiumPlan.id, key: "habits", enabled: true },
    { planId: premiumPlan.id, key: "goals", enabled: true },
    { planId: premiumPlan.id, key: "notes", enabled: true },
    { planId: premiumPlan.id, key: "basic_finance", enabled: true },
    { planId: premiumPlan.id, key: "basic_analytics", enabled: true },
    { planId: premiumPlan.id, key: "ai_assistant", enabled: true },
    { planId: premiumPlan.id, key: "ai_planner", enabled: true },
    { planId: premiumPlan.id, key: "ai_life_coach", enabled: true },
    { planId: premiumPlan.id, key: "advanced_finance", enabled: true },
    { planId: premiumPlan.id, key: "export_data", enabled: true },
    { planId: premiumPlan.id, key: "priority_support", enabled: true },
  ];

  for (const f of features) {
    await prisma.planFeature.upsert({
      where: { planId_featureKey: { planId: f.planId, featureKey: f.key } },
      update: { isEnabled: f.enabled },
      create: { planId: f.planId, featureKey: f.key, isEnabled: f.enabled },
    });
  }

  // Setup Plan Limits (-1 = unlimited)
  const limits = [
    // Free Limits
    { planId: freePlan.id, key: "projects", value: 3 },
    { planId: freePlan.id, key: "tasks", value: 100 },
    { planId: freePlan.id, key: "notes", value: 100 },
    { planId: freePlan.id, key: "habits", value: 5 },
    { planId: freePlan.id, key: "goals", value: 5 },
    { planId: freePlan.id, key: "documents_mb", value: 50 },
    { planId: freePlan.id, key: "ai_credits", value: 20 },

    // Pro Limits
    { planId: proPlan.id, key: "projects", value: -1 },
    { planId: proPlan.id, key: "tasks", value: -1 },
    { planId: proPlan.id, key: "notes", value: -1 },
    { planId: proPlan.id, key: "habits", value: -1 },
    { planId: proPlan.id, key: "goals", value: -1 },
    { planId: proPlan.id, key: "documents_mb", value: 5000 },
    { planId: proPlan.id, key: "ai_credits", value: 300 },

    // Premium Limits
    { planId: premiumPlan.id, key: "projects", value: -1 },
    { planId: premiumPlan.id, key: "tasks", value: -1 },
    { planId: premiumPlan.id, key: "notes", value: -1 },
    { planId: premiumPlan.id, key: "habits", value: -1 },
    { planId: premiumPlan.id, key: "goals", value: -1 },
    { planId: premiumPlan.id, key: "documents_mb", value: 50000 },
    { planId: premiumPlan.id, key: "ai_credits", value: 1000 },
  ];

  for (const l of limits) {
    await prisma.planLimit.upsert({
      where: { planId_limitKey: { planId: l.planId, limitKey: l.key } },
      update: { limitValue: l.value },
      create: { planId: l.planId, limitKey: l.key, limitValue: l.value },
    });
  }

  // 3. Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      name: "Chào mừng thành viên mới",
      discountType: "percentage",
      discountValue: 20,
      maxRedemptions: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      minimumAmount: 100000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "PRO50K" },
    update: {},
    create: {
      code: "PRO50K",
      name: "Giảm trực tiếp 50.000đ",
      discountType: "fixed",
      discountValue: 50000,
      maxRedemptions: 200,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      minimumAmount: 150000,
      isActive: true,
    },
  });

  // 4. Default Accounts (Admin, Support, Pro User)
  const salt = await bcrypt.genSalt(10);
  const passwordAdmin = await bcrypt.hash("Admin@123456", salt);
  const passwordSupport = await bcrypt.hash("Support@123456", salt);
  const passwordUser = await bcrypt.hash("User@123456", salt);

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@lifeos.app" },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: "admin@lifeos.app",
      passwordHash: passwordAdmin,
      role: "SUPER_ADMIN",
      referralCode: "ADMINVIP",
      profile: {
        create: {
          fullName: "Nguyên Architect",
          bio: "LifeOS Super Administrator & Lead Architect",
          onboardingCompleted: true,
        },
      },
    },
  });

  // Support User
  await prisma.user.upsert({
    where: { email: "support@lifeos.app" },
    update: { role: "SUPPORT" },
    create: {
      email: "support@lifeos.app",
      passwordHash: passwordSupport,
      role: "SUPPORT",
      referralCode: "SUPPORT01",
      profile: {
        create: {
          fullName: "LifeOS Specialist",
          bio: "Customer Success & Support Specialist",
          onboardingCompleted: true,
        },
      },
    },
  });

  // Standard User with Pro Subscription
  const proUser = await prisma.user.upsert({
    where: { email: "user@lifeos.app" },
    update: {},
    create: {
      email: "user@lifeos.app",
      passwordHash: passwordUser,
      role: "USER",
      referralCode: "USERLIFE26",
      profile: {
        create: {
          fullName: "Alex Nguyễn",
          bio: "Productivity enthusiast & startup founder",
          onboardingCompleted: true,
          onboardingGoals: JSON.stringify(["Productivity", "Finance", "Goals", "Habits"]),
        },
      },
      crmProfile: {
        create: {
          lifecycleStage: "active",
          healthScore: 95,
          tagsJson: JSON.stringify(["Early Adopter", "High Engagement", "Pro"]),
          internalNotes: "Active daily user, loves finance & habit modules.",
        },
      },
    },
  });

  // Active Subscription for Pro User
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.subscription.create({
    data: {
      userId: proUser.id,
      planId: proPlan.id,
      status: "active",
      billingCycle: "monthly",
      price: 199000,
      currency: "VND",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      provider: "vnpay",
      providerSubscriptionId: "VNPAY-SUB-DEMO-001",
    },
  });

  // AI Credit Initial Allocation for Pro User
  await prisma.aICreditLedger.create({
    data: {
      userId: proUser.id,
      type: "grant",
      amount: 300,
      balanceAfter: 300,
      feature: "monthly_plan_grant",
      description: "Cấp 300 credits gói Pro hàng tháng",
    },
  });

  // Seed sample data for user so life management modules are vibrant:
  const projWork = await prisma.project.create({
    data: {
      userId: proUser.id,
      name: "LifeOS SaaS Launch",
      description: "Xây dựng và phát hành nền tảng SaaS LifeOS",
      color: "#6366f1",
      icon: "rocket",
      status: "active",
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        userId: proUser.id,
        projectId: projWork.id,
        title: "Hoàn thiện hệ thống Payment VNPay & MoMo",
        description: "Kiểm thử chữ ký số HMAC-SHA512 và IPN webhook",
        status: "in_progress",
        priority: "urgent",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: proUser.id,
        projectId: projWork.id,
        title: "Tối ưu hóa bảng điều khiển Admin SaaS",
        description: "Bổ sung biểu đồ MRR, ARR, Churn Rate và CRM Pipeline",
        status: "todo",
        priority: "high",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: proUser.id,
        projectId: projWork.id,
        title: "Cấu hình AI Credit Ledger & Entitlements",
        description: "Đảm bảo đối soát token và hạn ngạch chính xác",
        status: "done",
        priority: "high",
        dueDate: new Date(),
        completedAt: new Date(),
      },
    ],
  });

  // Habits
  const habit1 = await prisma.habit.create({
    data: {
      userId: proUser.id,
      title: "Đọc sách 30 phút",
      description: "Đọc sách phát triển tư duy & kinh doanh",
      frequency: "daily",
      targetDaysPerWeek: 7,
      color: "#10b981",
      streak: 12,
      bestStreak: 21,
    },
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  await prisma.habitLog.create({
    data: {
      habitId: habit1.id,
      userId: proUser.id,
      date: todayStr,
      completed: true,
      notes: "Đọc chương 4 Atomic Habits",
    },
  });

  // Goals
  await prisma.goal.create({
    data: {
      userId: proUser.id,
      title: "Đạt 1,000 khách hàng trả phí LifeOS",
      description: "Chiến dịch tăng trưởng Organic & Referral",
      category: "career",
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      currentProgress: 45,
      targetValue: 1000,
      unit: "users",
      status: "in_progress",
    },
  });

  // Finance Accounts
  const bankAcc = await prisma.financeAccount.create({
    data: {
      userId: proUser.id,
      name: "Vietcombank Priority",
      type: "bank",
      balance: 125000000,
      currency: "VND",
      color: "#10b981",
      isDefault: true,
    },
  });

  const eWalletAcc = await prisma.financeAccount.create({
    data: {
      userId: proUser.id,
      name: "Ví MoMo",
      type: "e_wallet",
      balance: 4500000,
      currency: "VND",
      color: "#ec4899",
      isDefault: false,
    },
  });

  await prisma.financeTransaction.createMany({
    data: [
      {
        userId: proUser.id,
        accountId: bankAcc.id,
        type: "income",
        amount: 35000000,
        category: "salary",
        description: "Thu nhập dự án phần mềm",
        payee: "Khách hàng Doanh Nghiệp",
      },
      {
        userId: proUser.id,
        accountId: bankAcc.id,
        type: "expense",
        amount: 2500000,
        category: "bills",
        description: "Chi phí Server Cloud & API",
        payee: "Cloud Hosting Provider",
      },
      {
        userId: proUser.id,
        accountId: eWalletAcc.id,
        type: "expense",
        amount: 180000,
        category: "food",
        description: "Cà phê làm việc tại quán",
        payee: "Highlands Coffee",
      },
    ],
  });

  // Notes & Journal
  await prisma.note.create({
    data: {
      userId: proUser.id,
      title: "Ý tưởng chiến lược SaaS Q4",
      content: "# Mục tiêu Q4\n- Ra mắt tính năng AI Life Coach\n- Mở rộng cổng thanh toán MoMo & Stripe\n- Triển khai chương trình Affiliate đối tác",
      tagsJson: JSON.stringify(["SaaS", "Strategy", "Growth"]),
      folder: "Business",
      isPinned: true,
    },
  });

  await prisma.journalEntry.create({
    data: {
      userId: proUser.id,
      date: todayStr,
      mood: 5,
      title: "Ngày làm việc năng suất cao",
      reflection: "Hôm nay hoàn thành kiến trúc LifeOS SaaS, cảm giác rất phấn khởi và tràn đầy năng lượng.",
      gratitude: "Biết ơn vì có sức khỏe và cơ hội phát triển sản phẩm tuyệt vời.",
      learnings: "Kỷ luật và hệ thống luôn chiến thắng cảm xúc nhất thời.",
    },
  });

  // Health Log
  await prisma.healthLog.create({
    data: {
      userId: proUser.id,
      date: todayStr,
      weightKg: 68.5,
      sleepHours: 7.5,
      waterMl: 2500,
      exerciseMinutes: 45,
      moodScore: 5,
      notes: "Chạy bộ 5km buổi sáng",
    },
  });

  // Learning Item
  await prisma.learningItem.create({
    data: {
      userId: proUser.id,
      title: "Designing Data-Intensive Applications",
      type: "book",
      author: "Martin Kleppmann",
      totalUnits: 550,
      completedUnits: 380,
      unitType: "pages",
      status: "reading",
      rating: 5,
    },
  });

  // Announcement
  await prisma.announcement.create({
    data: {
      title: "Chào mừng bạn đến với LifeOS v2.0!",
      message: "Trải nghiệm không gian quản lý cuộc sống toàn diện với trợ lý AI và đồng bộ đa nền tảng.",
      targetAudience: "all",
      priority: "promotion",
      ctaText: "Khám phá ngay",
      ctaLink: "/dashboard",
      isActive: true,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("Accounts created:");
  console.log("  Admin:   admin@lifeos.app / Admin@123456");
  console.log("  Support: support@lifeos.app / Support@123456");
  console.log("  User:    user@lifeos.app / User@123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
