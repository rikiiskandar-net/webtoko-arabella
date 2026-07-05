import { SignJWT, jwtVerify } from "jose";

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

export function getUserFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export { COOKIE_NAME as USER_COOKIE_NAME };
