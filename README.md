# Subastas Loot

Web app de subastas: la portada muestra los productos activos (solo nombre y
precio), el detalle de cada producto tiene 4 fotos, video 360° e información
adicional, y hay un panel de administrador para cargar subastas, finalizarlas,
reactivarlas y ver los datos del ganador/suplente.

## Stack

- **Next.js** (App Router) — frontend + rutas de API (backend)
- **Supabase** (Postgres gratis) — base de datos real, persistente, igual en
  todos los dispositivos
- **Vercel** — hosting gratuito, se conecta directo al repo de GitHub

Las fotos y el video 360° **no se suben a este proyecto**: en el panel de
administrador se pega el link de un servicio externo (Google Drive, un
CDN de imágenes, YouTube/Vimeo no listado, etc.) para no gastar
almacenamiento del hosting.

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) → **New project** (es gratis).
2. Una vez creado, andá a **SQL Editor** → pegá **todo** el contenido de
   `supabase/schema.sql` de este repo → **Run**. Esto crea las 4 tablas
   (`productos`, `usuarios`, `ofertas`, `admin_config`) y los permisos.
3. Andá a **Project Settings → API** y copiá tres valores:
   - `Project URL`
   - `anon public` key
   - `service_role` key (¡esta es secreta, no se comparte!)

## 2. Configurar el proyecto localmente

```bash
npm install
cp .env.example .env.local
```

Editá `.env.local` y completá con los datos de Supabase del paso anterior,
más un `ADMIN_JWT_SECRET` inventado por vos (una cadena larga al azar, por
ejemplo generada con `openssl rand -hex 32`).

## 3. Cargar la contraseña del panel de administrador

La contraseña **nunca queda escrita en ningún archivo del proyecto ni en el
código fuente**: se hashea y el hash se guarda directamente en la tabla
`admin_config` de Supabase.

```bash
npm run hash-password
```

Te va a pedir la contraseña por consola (la que quieras usar) y la carga
en Supabase. Podés correr este mismo comando cuando quieras **resetear**
la contraseña desde la terminal; también hay un botón de engranaje (⚙️)
dentro del panel de administrador, una vez logueado, para cambiarla sin
tocar la terminal.

## 4. Probar en local

```bash
npm run dev
```

Abrí `http://localhost:3000` (portada) y `http://localhost:3000/admin`
(panel de administrador).

## 5. Subir a GitHub y publicar en Vercel

1. Creá un repositorio nuevo en GitHub y subí este proyecto (`git init`,
   `git add .`, `git commit -m "primer commit"`, `git push`).
   El archivo `.gitignore` ya excluye `.env.local`, así que tus claves de
   Supabase nunca se suben al repo.
2. Entrá a [vercel.com](https://vercel.com) → **Add New Project** → elegí
   ese repositorio de GitHub.
3. En **Environment Variables** cargá las mismas 4 variables que están en
   tu `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_JWT_SECRET`).
4. **Deploy**. Cada vez que hagas `git push`, Vercel vuelve a publicar
   automáticamente.

## Cómo funciona cada parte (resumen)

- **Portada** (`/`): lee de Supabase solo las subastas con `estado = 'activa'`
  y muestra nombre + precio actual.
- **Detalle** (`/producto/[id]`): fotos, video 360°, +info (tope de 675
  caracteres validado al cargar la subasta), login/registro, y el botón
  **Ofertar** (rechaza cualquier monto que no sea mayor al precio actual).
- **Registro/login de usuarios**: se registran con nombre, apellido,
  documento, fecha de nacimiento, teléfono y mail (todos obligatorios). Para
  volver a entrar alcanza con documento + mail; si no coinciden con un
  registro existente, no se permite el ingreso.
- **Ofertar**: la actualización del precio se hace con una operación atómica
  en la base (`UPDATE ... WHERE precio_actual < monto`) para que dos
  personas ofertando al mismo tiempo no pisen datos entre sí.
- **Panel de administrador** (`/admin`): pide la contraseña, y una vez
  adentro deja cargar una subasta nueva (todos los campos obligatorios,
  precio base siempre requerido), finalizar manualmente una subasta activa,
  ver los datos de contacto del ganador y el suplente (la mejor y la
  segunda mejor oferta, cada una de una persona distinta) de una subasta
  finalizada, y reactivarla (vuelve a "activa" con el precio base, pensado
  para cuando el ganador no completa la operación dentro de las 72hs).
- **Contraseña de administrador**: se guarda hasheada (bcrypt) en la base,
  nunca en texto plano en el código. La sesión del panel se maneja con una
  cookie firmada (JWT) que expira sola a las 8 horas.

## Nota sobre "finalizar el día indicado"

El enunciado original pide finalizar **siempre manualmente**, dentro del día
marcado al cargar el producto. Por eso no hay ningún proceso automático que
cierre subastas solo: la fecha de finalización se muestra como referencia en
el detalle del producto, pero quien decide cerrar la subasta (apretando
"Finalizar" en el panel) es el administrador.
