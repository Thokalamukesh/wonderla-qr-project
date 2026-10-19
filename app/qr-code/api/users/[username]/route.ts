import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest, isSuperadmin } from "../../../_lib/auth";
import { deleteUser } from "../../../_lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ username: string }> };

// Superadmin only: delete a user
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { username } = await params;
  if (!isSuperadmin(sessionFromRequest(req))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const ok = await deleteUser(decodeURIComponent(username));
    if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 400 });
  }
}
