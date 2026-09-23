import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { haySesionAdminValida } from "@/lib/adminSession";

export async function GET(_request, { params }) {
  if (!haySesionAdminValida()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: ofertas, error } = await supabaseAdmin
    .from("ofertas")
    .select("monto, creado_en, usuarios ( id, nombre, apellido, documento, fecha_nacimiento, telefono, mail )")
    .eq("producto_id", params.id)
    .order("monto", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "No se pudieron traer las ofertas." }, { status: 500 });
  }

  // Nos quedamos con la mejor oferta de cada usuario (una persona puede
  // haber ofertado varias veces) y ordenamos ese resumen de mayor a menor.
  const mejorPorUsuario = new Map();
  for (const oferta of ofertas) {
    const uid = oferta.usuarios?.id;
    if (!uid) continue;
    const actual = mejorPorUsuario.get(uid);
    if (!actual || oferta.monto > actual.monto) {
      mejorPorUsuario.set(uid, { monto: oferta.monto, usuario: oferta.usuarios });
    }
  }
  const ranking = [...mejorPorUsuario.values()].sort((a, b) => b.monto - a.monto);

  return NextResponse.json({
    ganador: ranking[0] || null,
    suplente: ranking[1] || null,
  });
}
