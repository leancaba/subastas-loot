import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/lib/supabaseClient";

// Siempre datos frescos (los precios cambian todo el tiempo) y sin
// intentar pre-renderizar esta página en el build, que no tiene acceso
// a una base de Supabase real.
export const dynamic = "force-dynamic";

async function obtenerSubastasActivas() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, marca, precio_actual, foto1")
    .eq("estado", "activa")
    .order("creado_en", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export default async function HomePage() {
  const productos = await obtenerSubastasActivas();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          SUBASTAS <span className="text-loot-orange">LOOT</span>
        </h1>
        <Link
          href="/admin"
          className="text-xs uppercase tracking-wide text-black/40 hover:text-black"
        >
          Administrador
        </Link>
      </div>

      <h2 className="mb-6 text-2xl font-semibold">Productos</h2>

      {productos.length === 0 ? (
        <p className="text-black/60">
          No hay subastas activas en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {productos.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.id}`}
              className="block overflow-hidden rounded-2xl border border-black/10 transition hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] w-full bg-loot-orange">
                {p.foto1 && (
                  <Image
                    src={p.foto1}
                    alt={p.nombre}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-lg font-bold leading-tight">{p.nombre}</p>
                {p.marca && (
                  <p className="text-sm text-black/50">{p.marca}</p>
                )}
                <div className="mt-2 inline-block rounded-pill bg-loot-black px-3 py-1 text-sm font-bold text-white">
                  $ {Number(p.precio_actual).toLocaleString("es-AR")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
