import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "worker_auth_token";
const TOKEN_TTL = "30d"; // 30 days for workers so they don't have to login often

function getSecret() {
  const secret = process.env.WORKER_AUTH_SECRET || "arabella-worker-secret-2025-secure";
  return new TextEncoder().encode(secret);
}

export async function signWorkerToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyWorkerToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function setWorkerAuthCookie(payload) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = await signWorkerToken(payload);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearWorkerAuthCookie() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getWorkerAuthSession() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyWorkerToken(token);
}

export async function hashWorkerPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyWorkerPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
