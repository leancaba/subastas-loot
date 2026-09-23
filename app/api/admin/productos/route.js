import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { haySesionAdminValida } from "@/lib/adminSession";

export async function GET() {
  if (!haySesionAdminValida()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("productos")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "No se pudo cargar la lista." }, { status: 500 });
    }
    return NextResponse.json({ productos: data });
  } catch (e) {
    console.error("Error en GET /api/admin/productos:", e);
    return NextResponse.json(
      { error: e?.message || "Error inesperado en el servidor." },
      { status: 500 }
    );
  }
}

const CAMPOS_OBLIGATORIOS = [
  "nombre",
  "marca",
  "fechaFinalizacion",
  "precioBase",
  "foto1",
  "foto2",
  "foto3",
  "foto4",
  "video360",
  "info",
];

export async function POST(request) {
  if (!haySesionAdminValida()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    const body = await request.json();

    for (const campo of CAMPOS_OBLIGATORIOS) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: "Todos los campos son obligatorios." },
          { status: 400 }
        );
      }
    }

    if (String(body.info).length > 675) {
      return NextResponse.json(
        { error: "El apartado +info supera los 675 caracteres." },
        { status: 400 }
      );
    }

    const precioBase = Number(body.precioBase);
    if (!Number.isFinite(precioBase) || precioBase <= 0) {
      return NextResponse.json(
        { error: "El precio base de subasta es obligatorio." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("productos")
      .insert({
        nombre: body.nombre,
        marca: body.marca,
        fecha_finalizacion: body.fechaFinalizacion,
        precio_base: precioBase,
        precio_actual: precioBase,
        foto1: body.foto1,
        foto2: body.foto2,
        foto3: body.foto3,
        foto4: body.foto4,
        video_360: body.video360,
        info: body.info,
        estado: "activa",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo crear la subasta." }, { status: 500 });
    }

    return NextResponse.json({ producto: data });
  } catch (e) {
    console.error("Error en POST /api/admin/productos:", e);
    return NextResponse.json(
      { error: e?.message || "Error inesperado en el servidor." },
      { status: 500 }
    );
  }
}
