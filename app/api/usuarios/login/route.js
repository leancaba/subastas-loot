import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { mail, documento } = await request.json();

    if (!mail || !documento) {
      return NextResponse.json(
        { error: "Completá mail y documento." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
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
  } catch (e) {
    console.error("Error en /api/usuarios/login:", e);
    return NextResponse.json(
      { error: e?.message || "Error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
