"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(null); // null = todavía no se sabe
  const [productos, setProductos] = useState([]);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [ganadorDe, setGanadorDe] = useState(null); // producto seleccionado

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    const res = await fetch("/api/admin/productos");
    if (res.status === 401) {
      setAutenticado(false);
      return;
    }
    const data = await res.json();
    setProductos(data.productos || []);
    setAutenticado(true);
  }

  async function cerrarSesion() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAutenticado(false);
  }

  async function finalizar(id) {
    await fetch(`/api/admin/productos/${id}/finalizar`, { method: "POST" });
    cargarProductos();
  }

  async function reactivar(id) {
    await fetch(`/api/admin/productos/${id}/reactivar`, { method: "POST" });
    cargarProductos();
  }

  if (autenticado === null) {
    return <main className="mx-auto max-w-md px-4 py-10">Cargando...</main>;
  }

  if (!autenticado) {
    return <LoginAdmin onOk={cargarProductos} />;
  }

  const activas = productos.filter((p) => p.estado === "activa");
  const finalizadas = productos.filter((p) => p.estado === "finalizada");

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <img src="/logo.png" alt="Subastas Loot" className="h-7 w-auto" />
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarConfig(true)}
            className="rounded-full border border-black/20 p-2"
            aria-label="Configuración"
            title="Resetear contraseña"
          >
            ⚙️
          </button>
          <button onClick={cerrarSesion} className="text-xs text-black/50 underline">
            Salir
          </button>
        </div>
      </div>

      <button
        onClick={() => setMostrarAlta(true)}
        className="btn-pill mb-8 w-full bg-black/30 text-white"
      >
        Cargar nueva subasta
      </button>

      <h2 className="mb-3 text-xl font-bold">Subastas activas</h2>
      <div className="mb-8 space-y-2">
        {activas.length === 0 && (
          <p className="text-sm text-black/50">No hay subastas activas.</p>
        )}
        {activas.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-pill border border-black/20 pl-4"
          >
            <span className="truncate">
              {p.nombre} — $ {Number(p.precio_actual).toLocaleString("es-AR")}
            </span>
            <button
              onClick={() => finalizar(p.id)}
              className="btn-pill rounded-l-none bg-loot-black text-white"
            >
              Finalizar
            </button>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-xl font-bold">Subastas finalizadas</h2>
      <div className="space-y-2">
        {finalizadas.length === 0 && (
          <p className="text-sm text-black/50">Todavía no hay subastas finalizadas.</p>
        )}
        {finalizadas.map((p) => (
          <div key={p.id} className="space-y-1">
            <div className="rounded-pill border border-black/20 px-4 py-2">
              {p.nombre}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGanadorDe(p)}
                className="btn-pill flex-1 bg-loot-black text-xs text-white"
              >
                Datos ganador y suplente
              </button>
              <button
                onClick={() => reactivar(p.id)}
                className="btn-pill flex-1 bg-red-700 text-xs text-white"
              >
                Reactivar
              </button>
            </div>
          </div>
        ))}
      </div>

      {mostrarAlta && (
        <ModalAltaSubasta
          onCerrar={() => setMostrarAlta(false)}
          onCreado={() => {
            setMostrarAlta(false);
            cargarProductos();
          }}
        />
      )}

      {mostrarConfig && (
        <ModalCambiarPassword onCerrar={() => setMostrarConfig(false)} />
      )}

      {ganadorDe && (
        <ModalGanador producto={ganadorDe} onCerrar={() => setGanadorDe(null)} />
      )}
    </main>
  );
}

function LoginAdmin({ onOk }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        // respuesta sin JSON (por ejemplo un 500 crudo del servidor)
      }
      if (!res.ok) {
        setError(data.error || `No se pudo iniciar sesión (código ${res.status}).`);
        return;
      }
      onOk();
    } catch (e) {
      setError("No se pudo conectar con el servidor. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4">
      <div className="w-full rounded-2xl border border-black/20 p-5">
        <h1 className="mb-4 text-center text-lg font-bold">
          Panel de administrador
        </h1>
        <input
          type="password"
          className="input-pill"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={entrar}
          disabled={cargando}
          className="btn-pill mt-3 w-full bg-black/70 text-white"
        >
          OK
        </button>
      </div>
    </main>
  );
}

function ModalCambiarPassword({ onCerrar }) {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function guardar() {
    setMensaje(null);
    if (nueva.length < 6) {
      setMensaje({ tipo: "error", texto: "Mínimo 6 caracteres." });
      return;
    }
    if (nueva !== confirmar) {
      setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
      return;
    }
    setCargando(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaPassword: nueva }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: data.error });
        return;
      }
      setMensaje({ tipo: "ok", texto: "Contraseña actualizada." });
      setNueva("");
      setConfirmar("");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Resetear contraseña</h3>
          <button onClick={onCerrar}>✕</button>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            className="input-pill"
            placeholder="Contraseña nueva"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <input
            type="password"
            className="input-pill"
            placeholder="Repetir contraseña nueva"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
          {mensaje && (
            <p
              className={
                mensaje.tipo === "error" ? "text-sm text-red-600" : "text-sm text-loot-teal"
              }
            >
              {mensaje.texto}
            </p>
          )}
          <button
            onClick={guardar}
            disabled={cargando}
            className="btn-pill w-full bg-black/70 text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalGanador({ producto, onCerrar }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/productos/${producto.id}/ganador`)
      .then((r) => r.json())
      .then(setDatos)
      .finally(() => setCargando(false));
  }, [producto.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-black p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white/60">{producto.nombre}</h3>
          <button onClick={onCerrar}>✕</button>
        </div>

        {cargando && <p>Cargando...</p>}

        {!cargando && datos?.ganador && (
          <PersonaFicha titulo="Ganador" color="text-red-500" persona={datos.ganador} />
        )}
        {!cargando && !datos?.ganador && (
          <p className="text-white/60">No hubo ofertas registradas.</p>
        )}

        {!cargando && datos?.suplente && (
          <div className="mt-6">
            <PersonaFicha titulo="Suplente" color="text-yellow-400" persona={datos.suplente} />
          </div>
        )}
      </div>
    </div>
  );
}

function PersonaFicha({ titulo, color, persona }) {
  const u = persona.usuario;
  return (
    <div>
      <h4 className={`mb-2 text-2xl font-extrabold ${color}`}>{titulo}</h4>
      <p>
        <b>Nombre/s:</b> {u.nombre}
      </p>
      <p>
        <b>Apellido/s:</b> {u.apellido}
      </p>
      <p>
        <b>Documento:</b> {u.documento}
      </p>
      <p>
        <b>Fecha de nacimiento:</b>{" "}
        {new Date(u.fecha_nacimiento).toLocaleDateString("es-AR")}
      </p>
      <p>
        <b>Teléfono:</b> {u.telefono}
      </p>
      <p>
        <b>Mail:</b> {u.mail}
      </p>
      <p>
        <b>Precio {titulo.toLowerCase()}:</b> ${" "}
        {Number(persona.monto).toLocaleString("es-AR")}
      </p>
    </div>
  );
}

function ModalAltaSubasta({ onCerrar, onCreado }) {
  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    fechaFinalizacion: "",
    precioBase: "",
    foto1: "",
    foto2: "",
    foto3: "",
    foto4: "",
    video360: "",
    info: "",
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function registrar() {
    setError(null);
    for (const [campo, valor] of Object.entries(form)) {
      if (!valor) {
        setError("Todos los campos son obligatorios.");
        return;
      }
    }
    if (form.info.length > 675) {
      setError("El apartado +info supera los 675 caracteres.");
      return;
    }
    setCargando(true);
    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      onCreado();
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Cargar nueva subasta</h3>
          <button onClick={onCerrar}>✕</button>
        </div>

        <div className="space-y-4">
          <Campo label="Nombre de producto" max={16}>
            <input
              className="input-pill"
              maxLength={16}
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
          </Campo>

          <Campo label="Marca" max={16}>
            <input
              className="input-pill"
              maxLength={16}
              value={form.marca}
              onChange={(e) => set("marca", e.target.value)}
            />
          </Campo>

          <Campo label="Fecha de finalización">
            <input
              type="date"
              className="input-pill"
              value={form.fechaFinalizacion}
              onChange={(e) => set("fechaFinalizacion", e.target.value)}
            />
          </Campo>

          <Campo label="Precio base de subasta (obligatorio)">
            <input
              type="number"
              className="input-pill"
              value={form.precioBase}
              onChange={(e) => set("precioBase", e.target.value)}
            />
          </Campo>

          {["foto1", "foto2", "foto3", "foto4"].map((campo, i) => (
            <Campo key={campo} label={`Foto ${i + 1} (link)`}>
              <input
                className="input-pill"
                placeholder="https://..."
                value={form[campo]}
                onChange={(e) => set(campo, e.target.value)}
              />
            </Campo>
          ))}

          <Campo label="Video 360° (link)">
            <input
              className="input-pill"
              placeholder="https://..."
              value={form.video360}
              onChange={(e) => set("video360", e.target.value)}
            />
          </Campo>

          <Campo label="+Info" max={675}>
            <textarea
              className="input-pill h-32 rounded-2xl"
              maxLength={675}
              value={form.info}
              onChange={(e) => set("info", e.target.value)}
            />
          </Campo>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={registrar}
            disabled={cargando}
            className="btn-pill w-full bg-black/40 text-white"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, max, children }) {
  const valorActual =
    children?.props?.value !== undefined ? String(children.props.value).length : 0;
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs uppercase text-black/50">
        <span>{label}</span>
        {max && (
          <span>
            {valorActual}/{max}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
