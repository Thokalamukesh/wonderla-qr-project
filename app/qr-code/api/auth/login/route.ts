import { NextRequest, NextResponse } from "next/server";
import { createToken, SESSION_COOKIE } from "../../../_lib/auth";
import { verifyCredentials } from "../../../_lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const session = await verifyCredentials(body.username || "", body.password || "");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }
  const { token, maxAge } = createToken(session);
  const res = NextResponse.json({ ok: true, user: session });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
