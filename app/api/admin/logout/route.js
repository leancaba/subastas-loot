import { NextResponse } from "next/server";
import { cerrarSesionAdmin } from "@/lib/adminSession";

export async function POST() {
  cerrarSesionAdmin();
  return NextResponse.json({ ok: true });
}
