import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, TOKEN_COOKIE_NAME } from "@/lib/auth";
import { generateReferralCode, processReferralRegistration } from "@/lib/referrals";
import { notifyNewUserRegistered } from "@/lib/telegram";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, referralCode } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user in local Prisma
    let existing = null;
    try {
      existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (e) {
      console.warn("[Register] Local prisma check warning:", e);
    }

    if (existing) {
      return NextResponse.json({ error: "Email này đã được đăng ký trong hệ thống" }, { status: 400 });
    }

    // Check existing user in Supabase Cloud
    try {
      const { data: sbExisting } = await supabase
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (sbExisting) {
        return NextResponse.json({ error: "Email này đã được đăng ký trong hệ thống" }, { status: 400 });
      }
    } catch (sbErr) {
      console.warn("[Register] Supabase check notice:", sbErr);
    }

    const passwordHash = await hashPassword(password);
    let userRefCode = generateReferralCode(fullName || email.split("@")[0]);
    // Ensure referral code is strictly unique
    const existingRef = await prisma.user.findUnique({
      where: { referralCode: userRefCode },
    });
    if (existingRef) {
      userRefCode = `${userRefCode}${Math.floor(100 + Math.random() * 900)}`;
    }

    // Create user with profile, initial CRM, and Free plan default
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "USER",
        referralCode: userRefCode,
        profile: {
          create: {
            fullName: fullName?.trim() || "Người dùng LifeOS",
            onboardingCompleted: false,
          },
        },
        crmProfile: {
          create: {
            lifecycleStage: "registered",
            healthScore: 100,
            tagsJson: JSON.stringify(["New Signup", "Free"]),
          },
        },
      },
      include: { profile: true },
    });

    // Create default Free Subscription record
    const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
    if (freePlan) {
      const now = new Date();
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: "active",
          billingCycle: "monthly",
          price: 0,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000), // Lifetime free
          provider: "internal",
        },
      });
    }

    // Grant initial AI credits (20 for Free plan)
    await prisma.aICreditLedger.create({
      data: {
        userId: user.id,
        type: "grant",
        amount: 20,
        balanceAfter: 20,
        feature: "welcome_grant",
        description: "Cấp khởi tạo 20 credits cho thành viên mới",
      },
    });

    // Process referral if code provided
    if (referralCode) {
      await processReferralRegistration({
        referralCode,
        newUserId: user.id,
        newUserEmail: user.email,
      });
    }

    // Create default personal workspace items
    const now = new Date();
    await prisma.financeAccount.create({
      data: {
        userId: user.id,
        name: "Tiền mặt / Ví chính",
        type: "cash",
        balance: 0,
        isDefault: true,
      },
    });

    await prisma.task.create({
      data: {
        userId: user.id,
        title: "Khám phá LifeOS - Trải nghiệm không gian sống số",
        description: "Xem qua các module Công việc, Thói quen, Mục tiêu và Tài chính.",
        priority: "high",
        status: "todo",
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Sync to Supabase Cloud for real-time cross-device persistence
    try {
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        password_hash: passwordHash,
        role: user.role,
        status: user.status,
        referral_code: user.referralCode,
        referred_by_id: user.referredById,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });

      if (user.profile) {
        await supabase.from("user_profiles").upsert({
          id: user.profile.id,
          user_id: user.id,
          full_name: user.profile.fullName,
          onboarding_completed: false,
          created_at: user.profile.createdAt.toISOString(),
          updated_at: user.profile.updatedAt.toISOString(),
        });
      }

      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan_id: "plan_free",
        status: "active",
        billing_cycle: "monthly",
        price: 0,
      });
    } catch (sbSyncErr) {
      console.warn("[Register] Supabase cloud sync notice:", sbSyncErr);
    }

    // Send real-time Telegram notification
    notifyNewUserRegistered({
      email: user.email,
      fullName: user.profile?.fullName,
      planName: "Free Starter",
    }).catch(console.error);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
        referralCode: user.referralCode,
      },
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Lỗi xử lý đăng ký" }, { status: 500 });
  }
}
