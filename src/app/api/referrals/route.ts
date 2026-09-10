import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getReferralStats } from "@/lib/referrals";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const stats = await getReferralStats(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const referralLink = `${appUrl}/register?ref=${stats.referralCode}`;

    return NextResponse.json({
      success: true,
      referralLink,
      ...stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
