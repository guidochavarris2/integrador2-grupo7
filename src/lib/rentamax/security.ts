export type Rol = "Operador" | "Supervisora" | "Administrador";

export const SESSION_IDLE_MS = 30 * 60 * 1000;
export const SESSION_MAX_MS = 8 * 60 * 60 * 1000;
export const LOGIN_MAX_FAILS = 5;
export const LOGIN_LOCK_MS = 2 * 60 * 1000;
export const AUDIT_LIMIT = 80;

export const PERMISSIONS = {
  dashboard: ["Operador", "Supervisora", "Administrador"],
  inventario_ver: ["Operador", "Supervisora", "Administrador"],
  inventario_alta: ["Supervisora", "Administrador"],
  alquileres: ["Operador", "Supervisora", "Administrador"],
  devoluciones: ["Operador", "Supervisora", "Administrador"],
  dni_completo: ["Supervisora", "Administrador"],
  kpis_completos: ["Supervisora", "Administrador"],
  seguridad: ["Administrador"],
  demo_reset: ["Administrador"],
  ayuda: ["Operador", "Supervisora", "Administrador"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(rol: Rol | null | undefined, permission: Permission) {
  if (!rol) return false;
  return (PERMISSIONS[permission] as readonly Rol[]).includes(rol);
}

export function roleLabel(rol: Rol) {
  if (rol === "Operador") return "Operador de piso";
  if (rol === "Supervisora") return "Supervisión de local";
  return "Administración";
}

export function roleSummary(rol: Rol) {
  if (rol === "Operador") {
    return "Registra alquileres y devoluciones. Consulta inventario. No da de alta equipos ni ve el DNI completo.";
  }
  if (rol === "Supervisora") {
    return "Opera el local, da de alta equipos y ve indicadores y DNI. No restablece la demo ni ve la bitácora de seguridad.";
  }
  return "Acceso total: inventario, operación, bitácora de seguridad y restablecer datos de demostración.";
}

export function sanitizeText(input: string, max = 120) {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function sanitizeName(input: string) {
  return sanitizeText(input, 80).replace(/[^\p{L}\p{N}\s.\-/]/gu, "");
}

export function maskDni(dni: string) {
  const d = dni.replace(/\D/g, "");
  if (d.length !== 8) return "********";
  return `${d.slice(0, 2)}****${d.slice(6)}`;
}

export function formatDniForRole(dni: string, rol?: Rol | null) {
  return can(rol, "dni_completo") ? dni : maskDni(dni);
}

export function timingSafeEqual(a: string, b: string) {
  const len = Math.max(a.length, b.length);
  let out = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    out |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return out === 0;
}

export async function hashPassword(email: string, password: string) {
  const payload = `rmx-v1|${email.trim().toLowerCase()}|${password}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function sessionExpired(issuedAt: number, lastSeen: number, now = Date.now()) {
  if (now - lastSeen > SESSION_IDLE_MS) return "inactividad";
  if (now - issuedAt > SESSION_MAX_MS) return "tiempo máximo";
  return null;
}

export function remainingLockMs(until: number, now = Date.now()) {
  return Math.max(0, until - now);
}

export function formatLock(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}:${String(r).padStart(2, "0")}`;
}
