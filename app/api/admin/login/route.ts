import { NextResponse } from "next/server";

import { checkAdminPassword, setAdminCookie } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  await setAdminCookie();

  return NextResponse.json({ ok: true });
}
