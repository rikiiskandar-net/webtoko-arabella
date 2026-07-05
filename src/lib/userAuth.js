import { SignJWT, jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const USER_JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || "user-secret-key-arabella-2025-secure"
);

const COOKIE_NAME = "user_token";
const EXPIRES_IN = "7d"; // Token berlaku 7 hari

export async function signUserToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRES_IN)
    .sign(USER_JWT_SECRET);
}

export async function verifyUserToken(token) {
  try {
    const { payload } = await jwtVerify(token, USER_JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = await verifyUserToken(token);
  if (!payload || !payload.userId) return null;

  // Cek keaktifan user langsung di database
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true }
    });

    if (!user || !user.isActive) {
      return null;
    }
  } catch (error) {
    console.error("Auth DB Error:", error);
    return null;
  }

  return payload;
}

export { COOKIE_NAME as USER_COOKIE_NAME };
