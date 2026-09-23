import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { haySesionAdminValida } from "@/lib/adminSession";

export async function POST(request) {
  if (!haySesionAdminValida()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { nuevaPassword } = await request.json();
  if (!nuevaPassword || nuevaPassword.length < 6) {
    return NextResponse.json(
      { error: "La contraseña nueva debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);
  const { error } = await supabaseAdmin
    .from("admin_config")
    .update({ password_hash: hash, actualizado_en: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
