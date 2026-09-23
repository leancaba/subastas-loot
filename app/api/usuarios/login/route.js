import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const { mail, documento } = await request.json();

  if (!mail || !documento) {
    return NextResponse.json(
      { error: "Completá mail y documento." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("*")
    .eq("mail", mail)
    .eq("documento", documento)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "No encontramos un registro con ese mail y documento." },
      { status: 404 }
    );
  }

  return NextResponse.json({ usuario: data });
}
