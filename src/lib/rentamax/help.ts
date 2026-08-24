import type { Rol } from "@/lib/rentamax/security";

export type HelpTopic = {
  id: string;
  title: string;
  problem: string;
  steps: string[];
  roles?: Rol[];
};

export const NAV_GUIDE = [
  {
    title: "1. Entrar",
    body: "Use el correo y la contraseña de su rol. El sistema bloquea la cuenta 2 minutos después de 5 intentos fallidos.",
  },
  {
    title: "2. Panel",
    body: "El dashboard muestra equipos, atrasos y alertas del día. El menú izquierdo cambia según su rol.",
  },
  {
    title: "3. Inventario",
    body: "Busque por código, nombre o categoría. El operador solo consulta. Supervisora y admin pueden registrar equipos.",
  },
  {
    title: "4. Alquiler",
    body: "Cliente, DNI de 8 dígitos, equipo disponible y fechas. Si el equipo ya está ocupado en esas fechas, el sistema lo bloquea.",
  },
  {
    title: "5. Devolución",
    body: "Elija Bueno (vuelve a disponible), Dañado (mantenimiento) o Perdido (baja). Dañado y perdido exigen observaciones.",
  },
  {
    title: "6. Ayuda",
    body: "El botón “?” abre esta guía. En Seguridad (solo admin) está la bitácora de accesos y denegaciones.",
  },
];

export const ROLE_GUIDE: Record<Rol, { sees: string[]; hidden: string[] }> = {
  Operador: {
    sees: [
      "Dashboard operativo y alertas de atraso",
      "Inventario en modo consulta",
      "Registrar alquileres y devoluciones",
      "DNI enmascarado (privacidad)",
    ],
    hidden: [
      "Alta de equipos",
      "Bitácora de seguridad",
      "Restablecer datos de demostración",
      "DNI completo del cliente",
    ],
  },
  Supervisora: {
    sees: [
      "Todos los KPI del dashboard",
      "Alta de equipos",
      "Alquileres y devoluciones",
      "DNI completo",
    ],
    hidden: ["Bitácora de seguridad", "Restablecer la demostración"],
  },
  Administrador: {
    sees: [
      "Todo el sistema",
      "Bitácora de autenticación y accesos denegados",
      "Restablecer datos de demostración",
    ],
    hidden: ["Nada: es el perfil de control total"],
  },
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "login",
    title: "No puedo iniciar sesión",
    problem: "El correo o la contraseña no coinciden, o la cuenta está bloqueada.",
    steps: [
      "Verifique mayúsculas en la contraseña. En la demo: RentaMax2026 (operador/supervisora) o Admin2026 (admin).",
      "Si aparece “cuenta bloqueada”, espere 2 minutos. Es la defensa ante fuerza bruta.",
      "Si ve “sesión expirada”, vuelva a entrar. La sesión caduca a los 30 minutos de inactividad.",
      "No cree cuentas nuevas: esta versión usa tres usuarios de demostración.",
    ],
  },
  {
    id: "permiso",
    title: "Me sale “No tiene permiso”",
    problem: "Su rol no incluye esa pantalla o esa acción.",
    steps: [
      "Revise su rol bajo el avatar (Operador, Supervisora o Administrador).",
      "El operador no registra equipos ni entra a Seguridad. Cierre sesión y entre con el rol que deba demostrar.",
      "Cada mutación se valida otra vez en la lógica, no solo se oculta el botón.",
    ],
  },
  {
    id: "dni",
    title: "El DNI no se acepta",
    problem: "El DNI peruano debe tener exactamente 8 números.",
    steps: [
      "Escriba solo dígitos. Letras y espacios se eliminan solos.",
      "Si falta un número, el formulario muestra el error antes de guardar.",
      "El operador verá el DNI como 45****12. Supervisora y admin ven los 8 dígitos.",
    ],
  },
  {
    id: "cruce",
    title: "No me deja alquilar un equipo",
    problem: "El equipo no está disponible o las fechas se cruzan con otro alquiler activo.",
    steps: [
      "En Inventario el estado debe ser Disponible.",
      "La fecha de fin no puede ser anterior a la de inicio.",
      "Si el mismo equipo ya tiene un alquiler activo en esas fechas, el cruce se bloquea.",
      "Libere el equipo con una devolución o elija otro.",
    ],
  },
  {
    id: "duplicado",
    title: "No puedo registrar un equipo",
    problem: "Nombre vacío, tarifa inválida, duplicado, o su rol no permite altas.",
    steps: [
      "Solo Supervisora y Administrador dan de alta equipos.",
      "El nombre no puede repetirse (sin importar mayúsculas).",
      "La tarifa diaria debe ser mayor a 0.",
      "No pegue HTML: el texto se sanitiza contra XSS.",
    ],
  },
  {
    id: "devolucion",
    title: "No cierra la devolución",
    problem: "Falta el estado del equipo o las observaciones cuando hay daño o pérdida.",
    steps: [
      "Elija Bueno, Dañado o Perdido.",
      "Si elige Dañado o Perdido, escriba qué ocurrió. Es obligatorio.",
      "Bueno → Disponible. Dañado → Mantenimiento. Perdido → Baja.",
    ],
  },
  {
    id: "sesion",
    title: "Me cerró la sesión solo",
    problem: "Caducidad por inactividad (30 min) o tiempo máximo (8 h).",
    steps: [
      "Vuelva a iniciar sesión. No se pierden inventario ni alquileres.",
      "Cualquier clic o tecla dentro de la app renueva la inactividad.",
    ],
  },
  {
    id: "demo",
    title: "Quiero volver a los datos de ejemplo",
    problem: "Los cambios de prueba dejaron el inventario distinto al de la demo.",
    steps: [
      "Entre como Administrador (admin@rentamax.pe / Admin2026).",
      "Use el botón Demo en la barra superior. Pedirá confirmación.",
      "Se restauran los 12 equipos y los alquileres de ejemplo, incluida ALQ-104 atrasada.",
    ],
    roles: ["Administrador"],
  },
];

export const DEMO_WALKTHROUGH = [
  "Inicie como Operador y registre un alquiler con DNI de 8 dígitos.",
  "Intente un DNI de 7 dígitos: debe rechazarse.",
  "Cierre sesión e intente 5 veces mal: debe bloquear 2 minutos.",
  "Entre como Supervisora y registre un equipo nuevo.",
  "Como Operador, abra “Registrar equipo”: debe denegar el acceso.",
  "Devuelva un equipo Dañado con observaciones y vea que pasa a mantenimiento.",
  "Como Admin, abra Seguridad y muestre la bitácora (login, denegaciones, altas).",
];
