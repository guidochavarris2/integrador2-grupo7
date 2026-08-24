import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rol } from "@/lib/rentamax/security";
import {
  AUDIT_LIMIT,
  LOGIN_LOCK_MS,
  LOGIN_MAX_FAILS,
  can,
  hashPassword,
  remainingLockMs,
  sanitizeName,
  sanitizeText,
  sessionExpired,
  timingSafeEqual,
} from "@/lib/rentamax/security";

export type { Rol };
export type Categoria = "Herramienta" | "Maquinaria" | "Estructura";
export type EquipoEstado = "disponible" | "alquilado" | "mantenimiento" | "baja";
export type CondicionDevolucion = "bueno" | "danado" | "perdido";
export type AlquilerEstado = "activo" | "cerrado";
export type AuditKind =
  | "login_ok"
  | "login_fail"
  | "login_lock"
  | "logout"
  | "session_expired"
  | "acceso_denegado"
  | "equipo_alta"
  | "alquiler_alta"
  | "devolucion"
  | "demo_reset";

export type Session = {
  email: string;
  nombre: string;
  rol: Rol;
  token: string;
  issuedAt: number;
  lastSeen: number;
};

export type Equipo = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: Categoria;
  tarifaDia: number;
  estado: EquipoEstado;
  registradoEn: string;
  mantenimientoDesde?: string;
};

export type Alquiler = {
  id: string;
  codigo: string;
  equipoId: string;
  clienteNombre: string;
  clienteDni: string;
  inicio: string;
  fin: string;
  estado: AlquilerEstado;
  creadoEn: string;
  devueltoEn?: string;
  condicion?: CondicionDevolucion;
  observaciones?: string;
  total: number;
  dias: number;
};

export type AuditEvent = {
  id: string;
  at: string;
  kind: AuditKind;
  actor: string;
  rol?: Rol;
  detail: string;
};

export type DemoUser = {
  email: string;
  password: string;
  passwordHash: string;
  nombre: string;
  rol: Rol;
};

export const DEMO_USERS: DemoUser[] = [
  {
    email: "carlos.mendoza@rentamax.pe",
    password: "RentaMax2026",
    passwordHash:
      "67ba599b8ca9c5e6e1b6f502e630736dfba812a910ddead5850f83a95388da4e",
    nombre: "Carlos Mendoza",
    rol: "Operador",
  },
  {
    email: "ana.silva@rentamax.pe",
    password: "RentaMax2026",
    passwordHash:
      "dc59f3cc0c6c51766ccdbe54fd2d8a07a9b5808f69be13cbd86e68a6fc038090",
    nombre: "Ana Silva",
    rol: "Supervisora",
  },
  {
    email: "admin@rentamax.pe",
    password: "Admin2026",
    passwordHash:
      "b893429046efa7286e5810c49abee0c9c2a86c3b2ff6ca918f67a10ddf0552a5",
    nombre: "Elmer Herrera",
    rol: "Administrador",
  },
];

export function todayIso(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoDayDiff(later: string, earlier: string) {
  const [ly, lm, ld] = later.split("-").map(Number);
  const [ey, em, ed] = earlier.split("-").map(Number);
  return Math.round(
    (Date.UTC(ly, lm - 1, ld) - Date.UTC(ey, em - 1, ed)) / 86_400_000,
  );
}

export function rentalStatus(
  alquiler: Alquiler,
  today = todayIso(),
): "activo" | "atrasado" | "cerrado" {
  if (alquiler.estado === "cerrado") return "cerrado";
  if (alquiler.fin < today) return "atrasado";
  return "activo";
}

export function daysBetween(inicio: string, fin: string) {
  return Math.max(1, isoDayDiff(fin, inicio));
}

export function daysLate(fin: string, today = todayIso()) {
  if (fin >= today) return 0;
  return isoDayDiff(today, fin);
}

export function datesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
) {
  return aStart <= bEnd && bStart <= aEnd;
}

function pad(n: number, size = 3) {
  return String(n).padStart(size, "0");
}

function nowStamp() {
  return new Date().toISOString();
}

function seedEquipos(): Equipo[] {
  return [
    {
      id: "eq-001",
      codigo: "EQ-001",
      nombre: "Taladro Percutor Bosch GSB 13 RE",
      categoria: "Herramienta",
      tarifaDia: 25,
      estado: "disponible",
      registradoEn: "2026-07-12",
    },
    {
      id: "eq-002",
      codigo: "EQ-002",
      nombre: "Andamio Modular 2m",
      categoria: "Estructura",
      tarifaDia: 40,
      estado: "alquilado",
      registradoEn: "2026-07-04",
    },
    {
      id: "eq-003",
      codigo: "EQ-003",
      nombre: "Mezcladora 1 saco",
      categoria: "Maquinaria",
      tarifaDia: 80,
      estado: "disponible",
      registradoEn: "2026-07-18",
    },
    {
      id: "eq-004",
      codigo: "EQ-004",
      nombre: "Sierra Circular Dewalt",
      categoria: "Herramienta",
      tarifaDia: 35,
      estado: "mantenimiento",
      registradoEn: "2026-06-22",
      mantenimientoDesde: "2026-08-15",
    },
    {
      id: "eq-005",
      codigo: "EQ-005",
      nombre: "Compactadora de suelo",
      categoria: "Maquinaria",
      tarifaDia: 120,
      estado: "alquilado",
      registradoEn: "2026-07-09",
    },
    {
      id: "eq-006",
      codigo: "EQ-006",
      nombre: "Escalera de extensión 6m",
      categoria: "Estructura",
      tarifaDia: 18,
      estado: "disponible",
      registradoEn: "2026-07-28",
    },
    {
      id: "eq-007",
      codigo: "EQ-007",
      nombre: "Rotomartillo Makita HR2470",
      categoria: "Herramienta",
      tarifaDia: 30,
      estado: "disponible",
      registradoEn: "2026-08-02",
    },
    {
      id: "eq-008",
      codigo: "EQ-008",
      nombre: "Generador 5 kVA",
      categoria: "Maquinaria",
      tarifaDia: 90,
      estado: "alquilado",
      registradoEn: "2026-06-30",
    },
    {
      id: "eq-009",
      codigo: "EQ-009",
      nombre: "Puntales metálicos x10",
      categoria: "Estructura",
      tarifaDia: 22,
      estado: "disponible",
      registradoEn: "2026-08-05",
    },
    {
      id: "eq-010",
      codigo: "EQ-010",
      nombre: "Cortadora de concreto",
      categoria: "Maquinaria",
      tarifaDia: 110,
      estado: "alquilado",
      registradoEn: "2026-07-21",
    },
    {
      id: "eq-011",
      codigo: "EQ-011",
      nombre: "Nivel láser Bosch GLL 3-80",
      categoria: "Herramienta",
      tarifaDia: 20,
      estado: "disponible",
      registradoEn: "2026-08-08",
    },
    {
      id: "eq-012",
      codigo: "EQ-012",
      nombre: "Carretilla de obra",
      categoria: "Herramienta",
      tarifaDia: 12,
      estado: "disponible",
      registradoEn: "2026-08-11",
    },
  ];
}

function seedAlquileres(): Alquiler[] {
  return [
    {
      id: "alq-103",
      codigo: "ALQ-103",
      equipoId: "eq-001",
      clienteNombre: "Carlos Ruiz",
      clienteDni: "28901234",
      inicio: "2026-08-01",
      fin: "2026-08-08",
      estado: "cerrado",
      creadoEn: "2026-08-01",
      devueltoEn: "2026-08-08",
      condicion: "bueno",
      observaciones: "Equipo en buen estado.",
      dias: 7,
      total: 175,
    },
    {
      id: "alq-104",
      codigo: "ALQ-104",
      equipoId: "eq-002",
      clienteNombre: "Juan Pérez",
      clienteDni: "45678912",
      inicio: "2026-08-12",
      fin: "2026-08-19",
      estado: "activo",
      creadoEn: "2026-08-12",
      dias: 7,
      total: 280,
    },
    {
      id: "alq-105",
      codigo: "ALQ-105",
      equipoId: "eq-005",
      clienteNombre: "María López",
      clienteDni: "70123456",
      inicio: "2026-08-18",
      fin: "2026-08-25",
      estado: "activo",
      creadoEn: "2026-08-18",
      dias: 7,
      total: 840,
    },
    {
      id: "alq-106",
      codigo: "ALQ-106",
      equipoId: "eq-008",
      clienteNombre: "Luis Torres",
      clienteDni: "41234567",
      inicio: "2026-08-20",
      fin: "2026-08-27",
      estado: "activo",
      creadoEn: "2026-08-20",
      dias: 7,
      total: 630,
    },
    {
      id: "alq-107",
      codigo: "ALQ-107",
      equipoId: "eq-010",
      clienteNombre: "Ana García",
      clienteDni: "33445566",
      inicio: "2026-08-15",
      fin: "2026-08-22",
      estado: "activo",
      creadoEn: "2026-08-15",
      dias: 7,
      total: 770,
    },
  ];
}

export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; error: string };
export type MutateResult = { ok: true; message: string } | { ok: false; error: string };

type LockState = { fails: number; until: number };

type Store = {
  hydrated: boolean;
  session: Session | null;
  equipos: Equipo[];
  alquileres: Alquiler[];
  nextEquipo: number;
  nextAlquiler: number;
  audit: AuditEvent[];
  lockouts: Record<string, LockState>;
  notice: string | null;
  setHydrated: () => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: (reason?: string) => void;
  touchSession: () => void;
  expireIfNeeded: () => boolean;
  addEquipo: (input: {
    nombre: string;
    categoria: Categoria;
    tarifaDia: number;
  }) => MutateResult;
  addAlquiler: (input: {
    equipoId: string;
    clienteNombre: string;
    clienteDni: string;
    inicio: string;
    fin: string;
  }) => MutateResult;
  devolver: (input: {
    alquilerId: string;
    condicion: CondicionDevolucion;
    observaciones: string;
  }) => MutateResult;
  resetDemo: () => MutateResult;
  deny: (detail: string) => void;
  clearNotice: () => void;
};

function initialData() {
  return {
    session: null as Session | null,
    equipos: seedEquipos(),
    alquileres: seedAlquileres(),
    nextEquipo: 13,
    nextAlquiler: 108,
    audit: [] as AuditEvent[],
    lockouts: {} as Record<string, LockState>,
    notice: null as string | null,
  };
}

function pushAudit(
  audit: AuditEvent[],
  event: Omit<AuditEvent, "id" | "at">,
): AuditEvent[] {
  const next: AuditEvent = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowStamp(),
    ...event,
  };
  return [next, ...audit].slice(0, AUDIT_LIMIT);
}

export const useRentaStore = create<Store>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialData(),
      setHydrated: () => set({ hydrated: true }),
      deny: (detail) => {
        const session = get().session;
        set({
          notice: detail,
          audit: pushAudit(get().audit, {
            kind: "acceso_denegado",
            actor: session?.email ?? "anónimo",
            rol: session?.rol,
            detail,
          }),
        });
      },
      clearNotice: () => set({ notice: null }),
      expireIfNeeded: () => {
        const session = get().session;
        if (!session || !session.issuedAt || !session.lastSeen) {
          if (session) set({ session: null });
          return Boolean(session);
        }
        const why = sessionExpired(session.issuedAt, session.lastSeen);
        if (!why) return false;
        set({
          session: null,
          notice: `Sesión cerrada por ${why}. Vuelva a iniciar sesión.`,
          audit: pushAudit(get().audit, {
            kind: "session_expired",
            actor: session.email,
            rol: session.rol,
            detail: `Caducidad por ${why}`,
          }),
        });
        return true;
      },
      touchSession: () => {
        const session = get().session;
        if (!session) return;
        if (sessionExpired(session.issuedAt, session.lastSeen)) {
          get().expireIfNeeded();
          return;
        }
        set({ session: { ...session, lastSeen: Date.now() } });
      },
      login: async (email, password) => {
        const key = email.trim().toLowerCase();
        const lock = get().lockouts[key];
        const wait = lock ? remainingLockMs(lock.until) : 0;
        if (wait > 0) {
          const mins = Math.ceil(wait / 1000);
          set({
            audit: pushAudit(get().audit, {
              kind: "login_lock",
              actor: key || "vacío",
              detail: `Intento con cuenta bloqueada (${mins}s restantes)`,
            }),
          });
          return {
            ok: false,
            error: `Cuenta bloqueada por intentos fallidos. Espere ${mins} segundos.`,
          };
        }
        if (!key || !password) {
          return { ok: false, error: "Ingrese correo y contraseña." };
        }
        const user = DEMO_USERS.find((u) => u.email.toLowerCase() === key);
        const hash = await hashPassword(key, password);
        const valid = user ? timingSafeEqual(hash, user.passwordHash) : false;
        if (!user || !valid) {
          const fails = (lock?.fails ?? 0) + 1;
          const until = fails >= LOGIN_MAX_FAILS ? Date.now() + LOGIN_LOCK_MS : 0;
          set({
            lockouts: { ...get().lockouts, [key]: { fails, until } },
            audit: pushAudit(get().audit, {
              kind: until ? "login_lock" : "login_fail",
              actor: key,
              detail: until
                ? "Cuenta bloqueada 2 minutos tras 5 intentos"
                : `Credencial inválida (${fails}/${LOGIN_MAX_FAILS})`,
            }),
          });
          if (until) {
            return {
              ok: false,
              error:
                "Cuenta bloqueada 2 minutos por intentos fallidos. Es una defensa ante fuerza bruta.",
            };
          }
          return { ok: false, error: "Correo o contraseña incorrectos." };
        }
        const now = Date.now();
        const session: Session = {
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          token:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `tok-${now}`,
          issuedAt: now,
          lastSeen: now,
        };
        const { [key]: _drop, ...restLocks } = get().lockouts;
        set({
          session,
          lockouts: restLocks,
          notice: null,
          audit: pushAudit(get().audit, {
            kind: "login_ok",
            actor: user.email,
            rol: user.rol,
            detail: `Inicio de sesión (${user.rol})`,
          }),
        });
        return { ok: true, session };
      },
      logout: (reason) => {
        const session = get().session;
        set({
          session: null,
          notice: reason ?? null,
          audit: session
            ? pushAudit(get().audit, {
                kind: "logout",
                actor: session.email,
                rol: session.rol,
                detail: reason ?? "Cierre de sesión",
              })
            : get().audit,
        });
      },
      addEquipo: ({ nombre, categoria, tarifaDia }) => {
        const session = get().session;
        if (!can(session?.rol, "inventario_alta")) {
          get().deny("Alta de equipo denegada: se requiere Supervisora o Administrador.");
          return {
            ok: false,
            error: "No tiene permiso para registrar equipos. Use una cuenta de Supervisora o Administrador.",
          };
        }
        const trimmed = sanitizeName(nombre);
        if (!trimmed) return { ok: false, error: "El nombre es obligatorio." };
        if (!categoria) return { ok: false, error: "Seleccione una categoría." };
        if (!Number.isFinite(tarifaDia) || tarifaDia <= 0) {
          return { ok: false, error: "La tarifa diaria debe ser mayor a 0." };
        }
        if (tarifaDia > 9999) {
          return { ok: false, error: "La tarifa diaria excede el máximo permitido." };
        }
        const dup = get().equipos.some(
          (e) => e.nombre.toLowerCase() === trimmed.toLowerCase() && e.estado !== "baja",
        );
        if (dup) {
          return { ok: false, error: "Ya existe un equipo con ese nombre." };
        }
        const n = get().nextEquipo;
        const equipo: Equipo = {
          id: `eq-${pad(n)}`,
          codigo: `EQ-${pad(n)}`,
          nombre: trimmed,
          categoria,
          tarifaDia: Math.round(tarifaDia * 100) / 100,
          estado: "disponible",
          registradoEn: todayIso(),
        };
        set({
          equipos: [equipo, ...get().equipos],
          nextEquipo: n + 1,
          audit: pushAudit(get().audit, {
            kind: "equipo_alta",
            actor: session!.email,
            rol: session!.rol,
            detail: `${equipo.codigo} · ${equipo.nombre}`,
          }),
        });
        return { ok: true, message: `Equipo ${equipo.codigo} registrado.` };
      },
      addAlquiler: ({ equipoId, clienteNombre, clienteDni, inicio, fin }) => {
        const session = get().session;
        if (!can(session?.rol, "alquileres")) {
          get().deny("Alquiler denegado: sesión insuficiente.");
          return { ok: false, error: "No tiene permiso para registrar alquileres." };
        }
        const nombre = sanitizeName(clienteNombre);
        const dni = clienteDni.replace(/\D/g, "").slice(0, 8);
        if (!nombre) return { ok: false, error: "El nombre del cliente es obligatorio." };
        if (dni.length !== 8) {
          return { ok: false, error: "El DNI debe tener 8 dígitos." };
        }
        if (!equipoId) return { ok: false, error: "Seleccione un equipo." };
        if (!inicio || !fin) {
          return { ok: false, error: "Indique las fechas de inicio y fin." };
        }
        if (fin < inicio) {
          return { ok: false, error: "La fecha de fin debe ser posterior al inicio." };
        }
        const equipo = get().equipos.find((e) => e.id === equipoId);
        if (!equipo) return { ok: false, error: "El equipo no existe." };
        if (equipo.estado !== "disponible") {
          return { ok: false, error: "El equipo no está disponible." };
        }
        const overlap = get().alquileres.some(
          (a) =>
            a.equipoId === equipoId &&
            a.estado !== "cerrado" &&
            datesOverlap(a.inicio, a.fin, inicio, fin),
        );
        if (overlap) {
          return {
            ok: false,
            error: "El equipo no está disponible en las fechas seleccionadas.",
          };
        }
        const dias = daysBetween(inicio, fin);
        const n = get().nextAlquiler;
        const alquiler: Alquiler = {
          id: `alq-${pad(n)}`,
          codigo: `ALQ-${pad(n)}`,
          equipoId,
          clienteNombre: nombre,
          clienteDni: dni,
          inicio,
          fin,
          estado: "activo",
          creadoEn: todayIso(),
          dias,
          total: dias * equipo.tarifaDia,
        };
        set({
          alquileres: [alquiler, ...get().alquileres],
          nextAlquiler: n + 1,
          equipos: get().equipos.map((e) =>
            e.id === equipoId ? { ...e, estado: "alquilado" as const } : e,
          ),
          audit: pushAudit(get().audit, {
            kind: "alquiler_alta",
            actor: session!.email,
            rol: session!.rol,
            detail: `${alquiler.codigo} · ${equipo.codigo} · DNI ${dni.slice(0, 2)}****`,
          }),
        });
        return { ok: true, message: `Alquiler ${alquiler.codigo} registrado.` };
      },
      devolver: ({ alquilerId, condicion, observaciones }) => {
        const session = get().session;
        if (!can(session?.rol, "devoluciones")) {
          get().deny("Devolución denegada: sesión insuficiente.");
          return { ok: false, error: "No tiene permiso para registrar devoluciones." };
        }
        const alquiler = get().alquileres.find((a) => a.id === alquilerId);
        if (!alquiler) return { ok: false, error: "No se encontró el alquiler." };
        if (alquiler.estado === "cerrado") {
          return { ok: false, error: "Este alquiler ya fue cerrado." };
        }
        if (!condicion) return { ok: false, error: "Seleccione el estado del equipo." };
        const notes = sanitizeText(observaciones, 400);
        if ((condicion === "danado" || condicion === "perdido") && !notes) {
          return {
            ok: false,
            error: "Las observaciones son obligatorias si el equipo está dañado o perdido.",
          };
        }
        const nextEquipoEstado: EquipoEstado =
          condicion === "bueno"
            ? "disponible"
            : condicion === "danado"
              ? "mantenimiento"
              : "baja";
        const today = todayIso();
        set({
          alquileres: get().alquileres.map((a) =>
            a.id === alquilerId
              ? {
                  ...a,
                  estado: "cerrado" as const,
                  devueltoEn: today,
                  condicion,
                  observaciones: notes,
                }
              : a,
          ),
          equipos: get().equipos.map((e) =>
            e.id === alquiler.equipoId
              ? {
                  ...e,
                  estado: nextEquipoEstado,
                  mantenimientoDesde:
                    nextEquipoEstado === "mantenimiento" ? today : undefined,
                }
              : e,
          ),
          audit: pushAudit(get().audit, {
            kind: "devolucion",
            actor: session!.email,
            rol: session!.rol,
            detail: `${alquiler.codigo} · ${condicion}`,
          }),
        });
        return { ok: true, message: `Devolución de ${alquiler.codigo} registrada.` };
      },
      resetDemo: () => {
        const session = get().session;
        if (!can(session?.rol, "demo_reset")) {
          get().deny("Reset de demostración denegado: solo Administrador.");
          return { ok: false, error: "Solo el administrador puede restablecer la demostración." };
        }
        const data = initialData();
        set({
          ...data,
          session,
          audit: pushAudit(get().audit, {
            kind: "demo_reset",
            actor: session!.email,
            rol: session!.rol,
            detail: "Inventario y alquileres restaurados",
          }),
        });
        return { ok: true, message: "Datos de demostración restaurados." };
      },
    }),
    {
      name: "rentamax-v2",
      skipHydration: true,
      partialize: (s) => ({
        session: s.session,
        equipos: s.equipos,
        alquileres: s.alquileres,
        nextEquipo: s.nextEquipo,
        nextAlquiler: s.nextAlquiler,
        audit: s.audit,
        lockouts: s.lockouts,
      }),
    },
  ),
);

export type AlertItem = {
  id: string;
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
  href?: string;
};

export function selectKpis(equipos: Equipo[], alquileres: Alquiler[]) {
  const today = todayIso();
  return {
    total: equipos.filter((e) => e.estado !== "baja").length,
    disponibles: equipos.filter((e) => e.estado === "disponible").length,
    alquilados: equipos.filter((e) => e.estado === "alquilado").length,
    mantenimiento: equipos.filter((e) => e.estado === "mantenimiento").length,
    atrasados: alquileres.filter((a) => rentalStatus(a, today) === "atrasado").length,
  };
}

export function selectAlerts(equipos: Equipo[], alquileres: Alquiler[]): AlertItem[] {
  const today = todayIso();
  const alerts: AlertItem[] = [];

  for (const a of alquileres) {
    if (rentalStatus(a, today) !== "atrasado") continue;
    const equipo = equipos.find((e) => e.id === a.equipoId);
    const late = daysLate(a.fin, today);
    alerts.push({
      id: `late-${a.id}`,
      tone: "danger",
      title: `${a.codigo} atrasado ${late} ${late === 1 ? "día" : "días"}`,
      detail: `${equipo?.nombre ?? "Equipo"} · ${a.clienteNombre}`,
      href: `/devoluciones/${a.id}`,
    });
  }

  for (const e of equipos) {
    if (e.estado !== "mantenimiento" || !e.mantenimientoDesde) continue;
    const days = isoDayDiff(todayIso(), e.mantenimientoDesde);
    if (days >= 7) {
      alerts.push({
        id: `mnt-${e.id}`,
        tone: "warning",
        title: `${e.codigo} en mantenimiento ${days} días`,
        detail: e.nombre,
        href: "/inventario",
      });
    }
  }

  for (const a of alquileres) {
    if (a.estado !== "activo") continue;
    const remaining = isoDayDiff(a.fin, today);
    if (remaining === 0) {
      const equipo = equipos.find((e) => e.id === a.equipoId);
      alerts.push({
        id: `due-today-${a.id}`,
        tone: "warning",
        title: `${equipo?.codigo ?? a.codigo} vence hoy`,
        detail: `${equipo?.nombre ?? "Equipo"} · ${a.clienteNombre}`,
        href: `/devoluciones/${a.id}`,
      });
    } else if (remaining === 1) {
      const equipo = equipos.find((e) => e.id === a.equipoId);
      alerts.push({
        id: `due-tom-${a.id}`,
        tone: "info",
        title: `${equipo?.codigo ?? a.codigo} vence mañana`,
        detail: `${equipo?.nombre ?? "Equipo"} · ${a.clienteNombre}`,
        href: `/devoluciones/${a.id}`,
      });
    }
  }

  return alerts;
}

export const CATEGORIAS: Categoria[] = ["Herramienta", "Maquinaria", "Estructura"];
