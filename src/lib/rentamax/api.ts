import type { Rol } from "@/lib/rentamax/security";

/**
 * Cliente del API de RentaMax (Spring Boot en Render).
 *
 * - La URL del backend NO esta escrita en el codigo: viene de la variable de entorno
 *   VITE_API_URL (en Vercel: Settings > Environment Variables; en local: archivo .env.local).
 *   Es una URL publica, no un secreto, por eso puede ir con prefijo VITE_.
 * - Las contrasenas NUNCA se guardan en el front: solo se envian por HTTPS a POST /api/auth/login,
 *   donde el servidor las compara contra el hash BCrypt de la base de datos.
 * - El token JWT que devuelve el login se manda como cabecera "Authorization: Bearer <token>".
 */
const RAW_API_URL = (import.meta.env?.VITE_API_URL as string | undefined) ?? "";
export const API_URL = RAW_API_URL.trim().replace(/\/+$/, "");
export const API_CONFIGURED = API_URL.length > 0;

/** Render (plan gratuito) puede tardar ~50 s en despertar: el timeout lo tolera. */
const TIMEOUT_MS = 75_000;

/** Roles del backend -> roles que usa la interfaz. */
const ROLE_MAP: Record<string, Rol> = {
  OPERADOR: "Operador",
  SUPERVISOR: "Supervisora",
  ADMINISTRADOR: "Administrador",
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiResult = {
  status: number;
  ok: boolean;
  ms: number;
  body: unknown;
};

/**
 * Peticion generica. No lanza error por codigos 4xx/5xx (los devuelve en `status`),
 * solo cuando no hay conexion o se agota el tiempo (status 0).
 */
export async function apiRequest(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<ApiResult> {
  if (!API_CONFIGURED) {
    throw new ApiError(0, "Falta configurar VITE_API_URL (URL del backend).");
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const ms = Math.round(performance.now() - started);
    let body: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { status: res.status, ok: res.ok, ms, body };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        0,
        "El servidor tardó demasiado en responder. Si estuvo inactivo, espere un minuto y reintente.",
      );
    }
    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Revise su conexión o intente en un minuto.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export type LoginOk = {
  token: string;
  /** Instante (ms) en que el token deja de ser valido segun el servidor. */
  expiresAt: number;
  email: string;
  rol: Rol;
  permisos: string[];
};

/** POST /api/auth/login. Lanza ApiError con un mensaje apto para mostrar al usuario. */
export async function apiLogin(email: string, password: string): Promise<LoginOk> {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: email.trim(), password },
  });
  if (res.status === 401) {
    throw new ApiError(401, "Correo o contraseña incorrectos.");
  }
  if (res.status === 400) {
    throw new ApiError(400, "Revise el formato del correo y la contraseña.");
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      "El servidor no pudo procesar el inicio de sesión. Intente de nuevo en un momento.",
    );
  }
  const data = res.body as {
    token?: string;
    expiraEnSegundos?: number;
    email?: string;
    rol?: string;
    permisos?: string[];
  } | null;
  const rol = data?.rol ? ROLE_MAP[data.rol] : undefined;
  if (!data?.token || !rol || !data.email) {
    throw new ApiError(502, "Respuesta inesperada del servidor.");
  }
  return {
    token: data.token,
    expiresAt: Date.now() + (data.expiraEnSegundos ?? 3600) * 1000,
    email: data.email,
    rol,
    permisos: data.permisos ?? [],
  };
}

/** "carlos.mendoza@rentamax.pe" -> "Carlos Mendoza" (el API no devuelve el nombre en el login). */
export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const words = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.length ? words.join(" ") : email;
}
