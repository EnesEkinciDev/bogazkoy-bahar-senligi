import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { cleanPlayers, cleanText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("teams")
    .select("id,name,captain,slogan,players,status,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ teams: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const name = cleanText(body.name, 100);
  const captain = cleanText(body.captain, 100);
  const phone = cleanText(body.phone, 40);
  const slogan = cleanText(body.slogan, 180);
  const players = cleanPlayers(body.players);

  if (!name || !captain || !phone || players.length < 2) {
    return NextResponse.json(
      { error: "Takım adı, kaptan, telefon ve en az 2 oyuncu gerekli." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name,
      captain,
      phone,
      slogan: slogan || null,
      players,
      status: "pending",
    })
    .select("id,name,captain,slogan,players,status,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team: data }, { status: 201 });
}
