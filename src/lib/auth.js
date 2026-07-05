// Import dinamis next/headers untuk menghindari bug InvariantError Next.js
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const TOKEN_TTL = 60 * 60 * 24; // 24 jam

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is required");
  return secret;
}

function signHmac(data) {
  return createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + TOKEN_TTL };
  const data = JSON.stringify(fullPayload);
  const base64 = Buffer.from(data).toString("base64");
  return `${base64}.${signHmac(base64)}`;
}

export function verifyToken(token) {
  try {
    const [base64, hmac] = token.split(".");
    if (!base64 || !hmac) return null;
    if (hmac !== signHmac(base64)) return null;
    const payload = JSON.parse(Buffer.from(base64, "base64").toString());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = signToken(payload);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL,
  });
}

export async function clearAuthCookie() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthSession() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function seedFirstAdmin() {
  const count = await prisma.admin.count();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.admin.create({
    data: {
      username,
      password: await hashPassword(password),
      name: "Admin Utama",
      role: "superadmin",
    },
  });

  console.log(`[Seed] Admin pertama dibuat: ${username}`);
}
