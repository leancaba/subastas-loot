import { createClient } from "@supabase/supabase-js";

// Esta clave es pública a propósito: Supabase la protege con
// las políticas de Row Level Security definidas en supabase/schema.sql.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
