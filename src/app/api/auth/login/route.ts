import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken, TOKEN_COOKIE_NAME } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ email và mật khẩu" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { profile: true },
      });
    } catch (dbErr) {
      console.warn("[Login] Local Prisma lookup failed:", dbErr);
    }

    // Cloud fallback: If user was registered on another device (PC -> Mobile) or another Vercel lambda
    if (!user) {
      try {
        const { data: sbUser } = await supabase
          .from("users")
          .select("*, profile:user_profiles(*)")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (sbUser) {
          // Rehydrate local SQLite so relations work seamlessly
          try {
            await prisma.user.upsert({
              where: { email: sbUser.email },
              update: {
                passwordHash: sbUser.password_hash,
                role: sbUser.role,
                status: sbUser.status,
              },
              create: {
                id: sbUser.id,
                email: sbUser.email,
                passwordHash: sbUser.password_hash,
                role: sbUser.role,
                status: sbUser.status,
                referralCode: sbUser.referral_code,
                referredById: sbUser.referred_by_id,
              },
            });

            const sbProfile = Array.isArray(sbUser.profile) ? sbUser.profile[0] : sbUser.profile;
            if (sbProfile) {
              await prisma.userProfile.upsert({
                where: { userId: sbUser.id },
                update: {
                  fullName: sbProfile.full_name,
                  avatarUrl: sbProfile.avatar_url,
                  onboardingCompleted: sbProfile.onboarding_completed,
                },
                create: {
                  userId: sbUser.id,
                  fullName: sbProfile.full_name,
                  avatarUrl: sbProfile.avatar_url,
                  onboardingCompleted: sbProfile.onboarding_completed,
                },
              });
            }

            user = await prisma.user.findUnique({
              where: { email: normalizedEmail },
              include: { profile: true },
            });
          } catch (cacheErr) {
            console.warn("[Login] Local Prisma cache failed, using Supabase record directly:", cacheErr);
            const sbProfile = Array.isArray(sbUser.profile) ? sbUser.profile[0] : sbUser.profile;
            user = {
              id: sbUser.id,
              email: sbUser.email,
              passwordHash: sbUser.password_hash,
              role: sbUser.role,
              status: sbUser.status,
              referralCode: sbUser.referral_code,
              profile: sbProfile || null,
            };
          }
        }
      } catch (sbErr) {
        console.warn("[Login] Supabase cloud lookup error:", sbErr);
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "Tài khoản của bạn đang tạm thời bị khóa. Vui lòng liên hệ bộ phận hỗ trợ." }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // Update CRM last activity safely
    try {
      await prisma.customerCRM.upsert({
        where: { userId: user.id },
        update: { lastActivityAt: new Date() },
        create: {
          userId: user.id,
          lifecycleStage: user.role === "ADMIN" ? "active" : "registered",
          lastActivityAt: new Date(),
        },
      });
    } catch {
      // Non-critical
    }

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
        onboardingCompleted: user.profile?.onboardingCompleted,
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
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Lỗi đăng nhập" }, { status: 500 });
  }
}
