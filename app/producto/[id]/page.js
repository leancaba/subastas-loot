"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabaseClient";

const USUARIO_STORAGE_KEY = "loot_usuario";

export default function ProductoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("fotos");
  const [fotoActiva, setFotoActiva] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [enviandoOferta, setEnviandoOferta] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);

  useEffect(() => {
    const guardado = window.localStorage.getItem(USUARIO_STORAGE_KEY);
    if (guardado) setUsuario(JSON.parse(guardado));
  }, []);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  async function cargarProducto() {
    setCargando(true);
    setErrorCarga(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .eq("estado", "activa")
        .maybeSingle();
      if (error) {
        setErrorCarga(error.message);
      } else {
        setProducto(data); // null si no existe o no está activa: se muestra "no disponible"
      }
    } catch (e) {
      setErrorCarga(e?.message || "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesionUsuario() {
    window.localStorage.removeItem(USUARIO_STORAGE_KEY);
    setUsuario(null);
  }

  async function enviarOferta() {
    setMensaje(null);
    if (!usuario) {
      setMostrarAuth(true);
      return;
    }
    const valor = Number(monto);
    if (!valor || valor <= Number(producto.precio_actual)) {
      setMensaje({
        tipo: "error",
        texto: "La oferta tiene que ser mayor al precio actual.",
      });
      return;
    }
    setEnviandoOferta(true);
    try {
      const res = await fetch("/api/ofertar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId: producto.id,
          usuarioId: usuario.id,
          monto: valor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: data.error });
      } else {
        setProducto((p) => ({ ...p, precio_actual: data.precio_actual }));
        setMonto("");
        setMensaje({ tipo: "ok", texto: "¡Oferta registrada!" });
      }
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo enviar la oferta." });
    } finally {
      setEnviandoOferta(false);
    }
  }

  if (cargando) {
    return <main className="mx-auto max-w-3xl px-4 py-10">Cargando...</main>;
  }
  if (errorCarga) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-red-600">
        No se pudo cargar el producto ({errorCarga}).
      </main>
    );
  }
  if (!producto) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        Esta subasta no está disponible.
      </main>
    );
  }

  const fotos = [producto.foto1, producto.foto2, producto.foto3, producto.foto4].filter(
    Boolean
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        <img src="/logo.png" alt="Subastas Loot" className="h-7 w-auto" />
      </h1>

      <h2 className="mt-6 text-3xl font-semibold">{producto.nombre}</h2>
      <p className="text-black/50">{producto.marca}</p>

      <div className="mt-4 flex gap-3 text-sm font-semibold">
        <button
          className={`btn-pill border ${
            tab === "fotos"
              ? "bg-loot-teal text-white border-loot-teal"
              : "border-loot-teal text-loot-teal"
          }`}
          onClick={() => setTab("fotos")}
        >
          Fotos
        </button>
        <button
          className={`btn-pill border ${
            tab === "video"
              ? "bg-loot-teal text-white border-loot-teal"
              : "border-loot-teal text-loot-teal"
          }`}
          onClick={() => setTab("video")}
        >
          Video 360°
        </button>
        <button
          className={`btn-pill border ${
            tab === "info"
              ? "bg-loot-teal text-white border-loot-teal"
              : "border-loot-teal text-loot-teal"
          }`}
          onClick={() => setTab("info")}
        >
          +Info
        </button>
      </div>

      <div className="mt-6 min-h-[320px]">
        {tab === "fotos" && fotos.length > 0 && (
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black/5">
              <Image
                key={fotoActiva}
                src={fotos[fotoActiva]}
                alt={producto.nombre}
                fill
                className="object-cover"
                unoptimized
              />
              {fotos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setFotoActiva((i) => (i - 1 + fotos.length) % fotos.length)
                    }
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setFotoActiva((i) => (i + 1) % fotos.length)}
                    aria-label="Foto siguiente"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {fotos.length > 1 && (
              <div className="mt-3 flex justify-center gap-2">
                {fotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFotoActiva(i)}
                    className={`h-2.5 w-2.5 rounded-full ${
                      i === fotoActiva ? "bg-loot-black" : "bg-black/20"
                    }`}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "video" && (
          <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black">
            <iframe
              src={producto.video_360}
              className="h-full w-full"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
        )}

        {tab === "info" && (
          <p className="whitespace-pre-wrap text-center text-black">
            {producto.info}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-pill bg-loot-black px-4 py-2 text-sm font-bold text-white">
          Finaliza{" "}
          {new Date(producto.fecha_finalizacion).toLocaleDateString("es-AR")}
        </div>

        <div className="flex items-center justify-between rounded-pill border border-black/20 px-4 py-2">
          {usuario ? (
            <>
              <span className="text-sm">
                <span className="text-black/50">Usuario:</span>{" "}
                <span className="font-bold">
                  {usuario.nombre} {usuario.apellido}
                </span>
              </span>
              <button
                onClick={cerrarSesionUsuario}
                className="ml-3 h-6 w-6 rounded-full bg-black/70 text-xs text-white"
                aria-label="Cerrar sesión"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setMostrarAuth(true)}
              className="w-full text-left text-sm font-bold uppercase text-black/70"
            >
              Iniciar sesión / Registrarme
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-pill bg-loot-black px-4 py-3 text-sm font-bold text-white">
            Precio actual{" "}
            <span className="float-right">
              $ {Number(producto.precio_actual).toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            className="input-pill flex-1"
            type="number"
            placeholder={`$ ${(Number(producto.precio_actual) + 1000).toLocaleString(
              "es-AR"
            )}`}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <button
            onClick={enviarOferta}
            disabled={enviandoOferta}
            className="btn-pill bg-loot-black text-white"
          >
            Ofertar
          </button>
        </div>

        {mensaje && (
          <p
            className={
              mensaje.tipo === "error"
                ? "text-sm text-red-600"
                : "text-sm text-loot-teal"
            }
          >
            {mensaje.texto}
          </p>
        )}
      </div>

      {mostrarAuth && (
        <AuthModal
          onCerrar={() => setMostrarAuth(false)}
          onAutenticado={(u) => {
            setUsuario(u);
            window.localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(u));
            setMostrarAuth(false);
          }}
        />
      )}
    </main>
  );
}

function AuthModal({ onCerrar, onAutenticado }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [loginMail, setLoginMail] = useState("");
  const [loginDocumento, setLoginDocumento] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    fechaNacimiento: "",
    telefono: "",
    mail: "",
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function hacerLogin() {
    setError(null);
    if (!loginMail || !loginDocumento) {
      setError("Completá mail y documento.");
      return;
    }
    setCargando(true);
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: loginMail, documento: loginDocumento }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No encontramos ese registro.");
        return;
      }
      onAutenticado(data.usuario);
    } finally {
      setCargando(false);
    }
  }

  async function hacerRegistro() {
    setError(null);
    const { nombre, apellido, documento, fechaNacimiento, telefono, mail } = form;
    if (!nombre || !apellido || !documento || !fechaNacimiento || !telefono || !mail) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setCargando(true);
    try {
      const res = await fetch("/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar.");
        return;
      }
      onAutenticado(data.usuario);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {modo === "login" ? "Login" : "Registro"}
          </h3>
          <button onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {modo === "login" ? (
          <div className="space-y-3">
            <input
              className="input-pill"
              placeholder="Mail"
              value={loginMail}
              onChange={(e) => setLoginMail(e.target.value)}
            />
            <input
              className="input-pill"
              placeholder="Documento"
              value={loginDocumento}
              onChange={(e) => setLoginDocumento(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={hacerLogin}
              disabled={cargando}
              className="btn-pill w-full bg-loot-black text-white"
            >
              OK
            </button>
            <button
              onClick={() => {
                setModo("registro");
                setError(null);
              }}
              className="w-full text-center text-xs text-black/50 underline"
            >
              No estoy registrado todavía
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              className="input-pill"
              placeholder="Nombre/s"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="input-pill"
              placeholder="Apellido/s"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                className="input-pill"
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) =>
                  setForm({ ...form, fechaNacimiento: e.target.value })
                }
              />
              <input
                className="input-pill"
                placeholder="Documento"
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
              />
            </div>
            <input
              className="input-pill"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <input
              className="input-pill"
              placeholder="Mail"
              value={form.mail}
              onChange={(e) => setForm({ ...form, mail: e.target.value })}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={hacerRegistro}
              disabled={cargando}
              className="btn-pill w-full bg-black/70 text-white"
            >
              Registrar
            </button>
            <button
              onClick={() => {
                setModo("login");
                setError(null);
              }}
              className="w-full text-center text-xs text-black/50 underline"
            >
              Ya estoy registrado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
