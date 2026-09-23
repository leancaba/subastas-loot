import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { productoId, usuarioId, monto } = await request.json();

    if (!productoId || !usuarioId || !monto) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      return NextResponse.json({ error: "Monto inválido." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Update condicional y atómico: solo pisa el precio si la subasta sigue
    // activa y el monto ofertado es mayor al precio actual. Evita condiciones
    // de carrera entre dos ofertas simultáneas.
    const { data: actualizado, error: errorUpdate } = await supabaseAdmin
      .from("productos")
      .update({ precio_actual: montoNumerico })
      .eq("id", productoId)
      .eq("estado", "activa")
      .lt("precio_actual", montoNumerico)
      .select()
      .maybeSingle();

    if (errorUpdate) {
      return NextResponse.json({ error: "No se pudo registrar la oferta." }, { status: 500 });
    }

    if (!actualizado) {
      return NextResponse.json(
        { error: "Tu oferta ya no es mayor al precio actual. Actualizá la página." },
        { status: 409 }
      );
    }

    const { error: errorOferta } = await supabaseAdmin.from("ofertas").insert({
      producto_id: productoId,
      usuario_id: usuarioId,
      monto: montoNumerico,
    });

    if (errorOferta) {
      // El precio ya quedó actualizado; igual devolvemos el precio nuevo,
      // pero avisamos del problema al registrar el historial de la oferta.
      console.error(errorOferta);
    }

    return NextResponse.json({ precio_actual: actualizado.precio_actual });
  } catch (e) {
    console.error("Error en /api/ofertar:", e);
    return NextResponse.json(
      { error: e?.message || "Error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
