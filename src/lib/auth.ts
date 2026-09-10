import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import { supabase } from "./supabase";

const JWT_SECRET = process.env.JWT_SECRET || "lifeos-super-secret-jwt-key-2026-life-management-platform";
export const TOKEN_COOKIE_NAME = "lifeos_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(req: NextRequest): string | null {
  // 1. Check cookies
  const cookie = req.cookies.get(TOKEN_COOKIE_NAME);
  if (cookie?.value) return cookie.value;

  // 2. Check Authorization Header
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export async function getCurrentUser(req: NextRequest) {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  let user: any = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        subscriptions: {
          where: { status: "active" },
          include: { plan: { include: { features: true, limits: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  } catch (dbErr) {
    console.warn("[Auth] Local prisma findUnique error:", dbErr);
  }

  // Cross-device / Vercel cloud fallback to Supabase nếu chưa có user trên local
  if (!user) {
    try {
      const { data: sbUser } = await supabase
        .from("users")
        .select("*, profile:user_profiles(*)")
        .eq("id", payload.userId)
        .maybeSingle();

      if (sbUser) {
        // Attempt to cache in local SQLite
        try {
          await prisma.user.upsert({
            where: { id: sbUser.id },
            update: {
              email: sbUser.email,
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
            where: { id: payload.userId },
            include: {
              profile: true,
              subscriptions: {
                where: { status: "active" },
                include: { plan: { include: { features: true, limits: true } } },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          });
        } catch (cacheErr) {
          const sbProfile = Array.isArray(sbUser.profile) ? sbUser.profile[0] : sbUser.profile;
          user = {
            id: sbUser.id,
            email: sbUser.email,
            role: sbUser.role,
            status: sbUser.status,
            referralCode: sbUser.referral_code,
            profile: sbProfile || { fullName: "LifeOS User", onboardingCompleted: true },
            subscriptions: [],
          };
        }
      }
    } catch (sbErr) {
      console.warn("[Auth] Supabase fallback error:", sbErr);
    }
  }

  // Cross-check: Nếu user chưa có active subscription trên local, kiểm tra Supabase Cloud
  if (user && (!user.subscriptions || user.subscriptions.length === 0)) {
    try {
      const { data: cloudSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("current_period_end", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cloudSub) {
        const planSlug =
          cloudSub.plan_id === "plan_premium"
            ? "premium"
            : cloudSub.plan_id === "plan_pro"
            ? "pro"
            : "free";

        const localPlan = await prisma.plan.findUnique({
          where: { slug: planSlug },
          include: { features: true, limits: true },
        });

        if (localPlan) {
          try {
            await prisma.subscription.upsert({
              where: { id: cloudSub.id },
              update: {
                status: "active",
                currentPeriodEnd: new Date(cloudSub.current_period_end),
              },
              create: {
                id: cloudSub.id,
                userId: user.id,
                planId: localPlan.id,
                status: "active",
                billingCycle: cloudSub.billing_cycle || "yearly",
                price: Number(cloudSub.price || 0),
                currency: cloudSub.currency || "VND",
                startDate: cloudSub.start_date ? new Date(cloudSub.start_date) : new Date(),
                currentPeriodStart: cloudSub.current_period_start ? new Date(cloudSub.current_period_start) : new Date(),
                currentPeriodEnd: new Date(cloudSub.current_period_end),
                provider: cloudSub.provider || "vietqr",
                providerSubscriptionId: cloudSub.provider_subscription_id,
              },
            });

            const refreshedSub = await prisma.subscription.findUnique({
              where: { id: cloudSub.id },
              include: { plan: { include: { features: true, limits: true } } },
            });
            if (refreshedSub) {
              user.subscriptions = [refreshedSub];
            }
          } catch (upsertErr) {}
        }
      }
    } catch (e) {}
  }

  if (!user || user.status === "SUSPENDED") return null;
  return user;
}

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const user = await requireAuth(req);
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient privileges");
  }
  return user;
}
