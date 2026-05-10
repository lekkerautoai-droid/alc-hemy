import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "bp_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return "dev-secret-please-change-in-prod-bells-and-paws";
  }
  return secret;
}

function sign(payload: string) {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  if (expected !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && data.exp < Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export async function createAdminSession() {
  const payload = Buffer.from(
    JSON.stringify({ sub: "admin", exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  const token = sign(payload);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroyAdminSession() {
  cookies().delete(COOKIE_NAME);
}

export async function isAdminAuthed() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verify(token) === "admin";
}

export function checkAdminPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // constant-time comparison
  const a = Buffer.from(password);
  const b = Buffer.from(input);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
