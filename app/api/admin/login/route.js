import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { crearSesionAdmin } from "@/lib/adminSession";

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: "Ingresá la contraseña." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
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
  } catch (e) {
    console.error("Error en /api/admin/login:", e);
    return NextResponse.json(
      { error: e?.message || "Error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
