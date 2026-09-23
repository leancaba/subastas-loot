/**
 * Carga (o resetea) la contraseña del panel de administrador.
 * Se corre UNA VEZ localmente (o cada vez que necesites resetearla a mano).
 * La contraseña en texto plano NUNCA se guarda en el repo ni en el código:
 * solo se hashea acá y el hash resultante se guarda en Supabase.
 *
 * Uso:
 *   node scripts/hash-password.js "miNuevaContraseña"
 * o simplemente:
 *   npm run hash-password
 * (te la va a pedir por consola sin mostrarla en pantalla)
 */

const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");
require("dotenv").config({ path: ".env.local" });

async function pedirPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Nueva contraseña de administrador: ", (respuesta) => {
      rl.close();
      resolve(respuesta.trim());
    });
  });
}

async function main() {
  const desdeArgumento = process.argv[2];
  const password = desdeArgumento || (await pedirPassword());

  if (!password || password.length < 6) {
    console.error("La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const supabase = createClient(url, serviceKey);

  const { error } = await supabase
    .from("admin_config")
    .update({ password_hash: hash, actualizado_en: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.error("No se pudo guardar el hash en Supabase:", error.message);
    process.exit(1);
  }

  console.log("Listo. La contraseña de administrador quedó actualizada.");
}

main();
