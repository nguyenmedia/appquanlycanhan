import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserActivePlan, getAICreditBalance } from "@/lib/entitlement";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { isMaintenanceModeEnabled } = await import("@/lib/maintenance");
    const isMaintenance = await isMaintenanceModeEnabled();
    const isMaintenanceAdmin = user ? ["ADMIN", "SUPER_ADMIN"].includes(user.role) : false;

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        maintenance: isMaintenance,
        isMaintenanceAdmin: false,
        user: null,
      });
    }

    if (isMaintenance && !isMaintenanceAdmin) {
      return NextResponse.json(
        {
          authenticated: true,
          maintenance: true,
          isMaintenanceAdmin: false,
          error: "Hệ thống đang trong chế độ bảo trì nâng cấp. Vui lòng quay lại sau ít phút.",
          user: null,
        },
        { status: 503 }
      );
    }


    const [activePlan, aiCredits, activeAnnouncements] = await Promise.all([
      getUserActivePlan(user.id),
      getAICreditBalance(user.id),
      prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    let activeSub = user.subscriptions && user.subscriptions[0];
    if (!activeSub && activePlan?.slug !== "free") {
      activeSub = await prisma.subscription.findFirst({
        where: { userId: user.id, status: "active" },
        include: { plan: { include: { features: true, limits: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      authenticated: true,
      maintenance: isMaintenance,
      isMaintenanceAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        profile: user.profile,
        plan: activePlan,
        subscription: activeSub || null,
        aiCredits,
        announcements: activeAnnouncements,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      bio,
      avatarUrl,
      timezone,
      currency,
      preferencesJson,
      onboardingGoals,
      currentPassword,
      newPassword,
    } = body;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới" },
          { status: 400 }
        );
      }
      const { verifyPassword, hashPassword } = await import("@/lib/auth");
      const isMatch = await verifyPassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không chính xác" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu mới phải có tối thiểu 6 ký tự" },
          { status: 400 }
        );
      }
      const newHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    // Upsert UserProfile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(timezone !== undefined && { timezone }),
        ...(currency !== undefined && { currency }),
        ...(preferencesJson !== undefined && {
          preferencesJson:
            typeof preferencesJson === "string"
              ? preferencesJson
              : JSON.stringify(preferencesJson),
        }),
        ...(onboardingGoals !== undefined && {
          onboardingGoals:
            typeof onboardingGoals === "string"
              ? onboardingGoals
              : JSON.stringify(onboardingGoals),
        }),
      },
      create: {
        userId: user.id,
        fullName: fullName || "Người dùng LifeOS",
        phone: phone || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        timezone: timezone || "Asia/Ho_Chi_Minh",
        currency: currency || "VND",
        preferencesJson:
          typeof preferencesJson === "string"
            ? preferencesJson
            : preferencesJson
            ? JSON.stringify(preferencesJson)
            : null,
      },
    });

    const [activePlan, aiCredits] = await Promise.all([
      getUserActivePlan(user.id),
      getAICreditBalance(user.id),
    ]);

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        profile: updatedProfile,
        plan: activePlan,
        subscription: user.subscriptions[0] || null,
        aiCredits,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi cập nhật hồ sơ" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}

