import "server-only";
import { createClient } from "@supabase/supabase-js";

// service_role salta RLS: por eso este archivo tiene "server-only" y
// SOLO debe usarse desde rutas dentro de app/api (nunca desde un
// componente de cliente). La clave nunca llega al navegador.
//
// El cliente se crea recién la primera vez que se usa (no al importar
// el archivo), para que el build de Next.js no se caiga si en ese
// momento no hay variables de entorno disponibles.
let cliente;

export function getSupabaseAdmin() {
  if (!cliente) {
    // Acepta tanto los nombres clásicos como los que genera la
    // integración de Vercel Storage (prefijo STORAGE_). La service_role
    // key nunca la auto-genera Vercel: hay que copiarla a mano desde
    // Supabase (Settings > API > service_role) y cargarla como
    // SUPABASE_SERVICE_ROLE_KEY.
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(
        "Faltan la URL de Supabase o SUPABASE_SERVICE_ROLE_KEY. " +
          "Revisá las variables de entorno del proyecto en Vercel."
      );
    }
    cliente = createClient(url, serviceKey, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }
  return cliente;
}
