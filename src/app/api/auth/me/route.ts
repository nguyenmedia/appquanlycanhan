import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserActivePlan, getAICreditBalance } from "@/lib/entitlement";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
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

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        profile: user.profile,
        plan: activePlan,
        subscription: user.subscriptions[0] || null,
        aiCredits,
        announcements: activeAnnouncements,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
