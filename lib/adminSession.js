import "server-only";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "loot_admin_session";
const DURACION_SEGUNDOS = 60 * 60 * 8; // 8 horas

export function crearSesionAdmin() {
  const token = jwt.sign({ rol: "admin" }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: DURACION_SEGUNDOS,
  });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export function cerrarSesionAdmin() {
  cookies().delete(COOKIE_NAME);
}

export function haySesionAdminValida() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
