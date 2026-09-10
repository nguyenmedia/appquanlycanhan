import prisma from "./prisma";

export function generateReferralCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "LIFE";
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${randomSuffix}`;
}

export async function processReferralRegistration({
  referralCode,
  newUserId,
  newUserEmail,
}: {
  referralCode?: string;
  newUserId: string;
  newUserEmail: string;
}) {
  if (!referralCode || !referralCode.trim()) return null;

  const referrer = await prisma.user.findUnique({
    where: { referralCode: referralCode.trim().toUpperCase() },
  });

  if (!referrer) return null;

  // Anti-fraud: cannot refer oneself
  if (referrer.id === newUserId || referrer.email.toLowerCase() === newUserEmail.toLowerCase()) {
    return null;
  }

  // Update referred_by_id on new user
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  });

  // Create pending referral entry
  const referral = await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredUserId: newUserId,
      code: referralCode.trim().toUpperCase(),
      status: "pending",
      rewardDays: 7, // default 7 days Pro
    },
  });

  return referral;
}

export async function getReferralStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referredUser: {
        select: {
          email: true,
          profile: { select: { fullName: true } },
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = referrals.length;
  const rewarded = referrals.filter((r) => r.status === "rewarded").length;
  const pending = referrals.filter((r) => r.status === "pending").length;
  const totalDaysEarned = rewarded * 7;

  return {
    referralCode: user?.referralCode || "",
    total,
    successful: rewarded,
    pending,
    rewardsEarnedDays: totalDaysEarned,
    history: referrals,
  };
}
