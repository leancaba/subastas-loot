import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { haySesionAdminValida } from "@/lib/adminSession";

// Se usa cuando el ganador no finaliza la operación dentro de las 72hs
// (o cualquier otro motivo) y el producto vuelve a subastarse desde cero:
// vuelve a "activa" y el precio se reinicia al precio base.
export async function POST(_request, { params }) {
  if (!haySesionAdminValida()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: producto, error: errorLectura } = await supabaseAdmin
      .from("productos")
      .select("precio_base")
      .eq("id", params.id)
      .single();

    if (errorLectura || !producto) {
      return NextResponse.json({ error: "Subasta no encontrada." }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("productos")
      .update({ estado: "activa", precio_actual: producto.precio_base })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: "No se pudo reactivar." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error en /api/admin/productos/[id]/reactivar:", e);
    return NextResponse.json(
      { error: e?.message || "Error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
