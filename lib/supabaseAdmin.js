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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(
        "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. " +
          "Revisá las variables de entorno del proyecto en Vercel."
      );
    }
    cliente = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  return cliente;
}
