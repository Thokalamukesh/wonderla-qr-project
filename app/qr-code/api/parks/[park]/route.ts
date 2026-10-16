import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest, isSuperadmin, canEditPark } from "../../../_lib/auth";
import { getPark, savePark, deletePark } from "../../../_lib/store";
import type { ParkConfig } from "../../../_lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { park: string } };

// Public: read one park's full config
export async function GET(_req: NextRequest, { params }: Ctx) {
  const cfg = await getPark(params.park);
  if (!cfg) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, config: cfg }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

// Superadmin (any park) or park user (own park): update config
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = sessionFromRequest(req);
  if (!canEditPark(session, params.park)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const existing = await getPark(params.park);
  if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  let body: Partial<ParkConfig>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // slug is always immutable. Park users may not flip the active flag;
  // only a superadmin controls whether a park is published.
  const merged: ParkConfig = { ...existing, ...body, slug: existing.slug };
  if (!isSuperadmin(session)) merged.active = existing.active;

  const saved = await savePark(merged);
  return NextResponse.json({ ok: true, config: saved });
}

// Superadmin only: delete a park
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isSuperadmin(sessionFromRequest(req))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const ok = await deletePark(params.park);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
