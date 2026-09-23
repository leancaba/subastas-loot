import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { crearSesionAdmin } from "@/lib/adminSession";

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: "Ingresá la contraseña." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_config")
    .select("password_hash")
    .eq("id", 1)
    .single();

  if (error || !data || !data.password_hash) {
    return NextResponse.json(
      { error: "El panel todavía no tiene una contraseña configurada." },
      { status: 500 }
    );
  }

  const coincide = await bcrypt.compare(password, data.password_hash);
  if (!coincide) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  crearSesionAdmin();
  return NextResponse.json({ ok: true });
}
