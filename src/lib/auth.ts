import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

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

  const user = await prisma.user.findUnique({
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
