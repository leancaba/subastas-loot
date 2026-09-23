-- ============================================================
-- SUBASTAS LOOT — Esquema de base de datos (Supabase / Postgres)
-- Pegar este archivo completo en Supabase > SQL Editor > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PRODUCTOS EN SUBASTA ----------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  marca text not null,
  precio_base numeric(12,2) not null,
  precio_actual numeric(12,2) not null,
  fecha_finalizacion date not null,
  foto1 text not null,
  foto2 text not null,
  foto3 text not null,
  foto4 text not null,
  video_360 text not null,
  info text not null check (char_length(info) <= 675),
  estado text not null default 'activa' check (estado in ('activa', 'finalizada')),
  creado_en timestamptz not null default now()
);

-- ---------- USUARIOS REGISTRADOS (para ofertar) ----------
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  documento text not null,
  fecha_nacimiento date not null,
  telefono text not null,
  mail text not null,
  creado_en timestamptz not null default now(),
  unique (documento, mail)
);
-- Un mismo documento no puede registrarse dos veces con mails distintos
create unique index if not exists usuarios_documento_unico on usuarios (documento);

-- ---------- OFERTAS ----------
create table if not exists ofertas (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  monto numeric(12,2) not null,
  creado_en timestamptz not null default now()
);
create index if not exists ofertas_producto_idx on ofertas (producto_id, monto desc);

-- ---------- CONFIG DEL ADMINISTRADOR (contraseña hasheada) ----------
create table if not exists admin_config (
  id int primary key default 1,
  password_hash text not null,
  actualizado_en timestamptz not null default now(),
  constraint admin_config_single_row check (id = 1)
);

-- Semilla: fila única de config. La contraseña se carga después con
-- "npm run hash-password" (ver README) — acá solo se crea la fila vacía
-- para que el script de hash tenga dónde hacer UPDATE.
insert into admin_config (id, password_hash)
values (1, '')
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- Con la anon key (pública, usada en el navegador) solo se puede:
--   - leer productos ACTIVOS
--   - insertar un registro en "usuarios" (registro público)
--   - leer "usuarios" para el login (documento + mail)
-- Todo lo demás (crear/finalizar/reactivar subastas, ver ganador,
-- cambiar contraseña de admin, insertar ofertas) pasa SIEMPRE por
-- las rutas /app/api del servidor, que usan la service_role key y
-- saltean RLS. La anon key nunca puede escribir en productos, ofertas
-- ni admin_config.
-- ============================================================

alter table productos enable row level security;
alter table usuarios enable row level security;
alter table ofertas enable row level security;
alter table admin_config enable row level security;

drop policy if exists "productos activos son publicos" on productos;
create policy "productos activos son publicos"
  on productos for select
  using (estado = 'activa');

drop policy if exists "cualquiera puede registrarse" on usuarios;
create policy "cualquiera puede registrarse"
  on usuarios for insert
  with check (true);

drop policy if exists "login por documento y mail" on usuarios;
create policy "login por documento y mail"
  on usuarios for select
  using (true);

-- ofertas y admin_config: sin policies de select/insert públicas =
-- inaccesibles con la anon key. Solo la service_role (servidor) entra.
