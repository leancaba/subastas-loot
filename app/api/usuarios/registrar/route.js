import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.json();
  const { nombre, apellido, documento, fechaNacimiento, telefono, mail } = body;

  if (!nombre || !apellido || !documento || !fechaNacimiento || !telefono || !mail) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios." },
      { status: 400 }
    );
  }

  // ¿Ya existe ese documento?
  const { data: existente } = await supabaseAdmin
    .from("usuarios")
    .select("id, mail")
    .eq("documento", documento)
    .maybeSingle();

  if (existente) {
    return NextResponse.json(
      {
        error:
          "Ese documento ya está registrado. Iniciá sesión con tu documento y mail.",
      },
      { status: 409 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert({
      nombre,
      apellido,
      documento,
      fecha_nacimiento: fechaNacimiento,
      telefono,
      mail,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo registrar." }, { status: 500 });
  }

  return NextResponse.json({ usuario: data });
}
