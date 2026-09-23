import { createClient } from "@supabase/supabase-js";

// El cliente se crea recién la primera vez que se usa, no al importar
// este archivo. Así, si alguna vez faltan las variables de entorno,
// el error aparece cuando de verdad se intenta consultar Supabase (con
// un mensaje claro), y no rompe el build de Next.js ni otras páginas
// que no dependen de esto.
let cliente;

export function getSupabase() {
  if (!cliente) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
          "Revisá las variables de entorno del proyecto."
      );
    }
    cliente = createClient(url, anonKey);
  }
  return cliente;
}
