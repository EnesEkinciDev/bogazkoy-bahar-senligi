import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/adminAuth";
import { createDraw, suggestGroupCount } from "@/lib/draw";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { DrawMode } from "@/lib/types";

const modes = new Set(["groups", "knockout"]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const mode = typeof body?.mode === "string" ? body.mode : "groups";

  if (!modes.has(mode)) {
    return NextResponse.json({ error: "Geçersiz kura tipi." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("id,name,captain,slogan,players,status,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  if (!teams || teams.length < 2) {
    return NextResponse.json({ error: "Kura için en az 2 onaylı takım gerekli." }, { status: 400 });
  }

  const groupCount =
    typeof body?.groupCount === "number" ? body.groupCount : suggestGroupCount(teams.length);
  const result = createDraw(teams, mode as DrawMode, groupCount);

  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .insert({
      type: mode,
      group_count: result.type === "groups" ? result.groupCount : null,
      result,
    })
    .select("id,type,group_count,result,created_at")
    .single();

  if (drawError) {
    return NextResponse.json({ error: drawError.message }, { status: 500 });
  }

  return NextResponse.json({ draw }, { status: 201 });
}
