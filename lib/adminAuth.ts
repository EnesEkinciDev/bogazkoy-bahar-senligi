import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bogazkoy_admin";

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function cookieValue() {
  const secret = getAdminSecret();

  if (!secret) {
    return "";
  }

  return createHash("sha256").update(secret).digest("hex");
}

export async function isAdminRequest() {
  const expected = cookieValue();

  if (!expected) {
    return false;
  }

  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value === expected;
}

export async function setAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, cookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

export function checkAdminPassword(password: string) {
  const secret = getAdminSecret();

  return Boolean(secret) && password === secret;
}
