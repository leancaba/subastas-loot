import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { haySesionAdminValida } from "@/lib/adminSession";

export async function POST(_request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!haySesionAdminValida()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("productos")
    .update({ estado: "finalizada" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "No se pudo finalizar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
