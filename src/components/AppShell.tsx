import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  CircleHelp,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Shield,
  Truck,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SessionWatch } from "@/components/SessionWatch";
import { Button } from "@/components/ui/button";
import { can, roleLabel, type Permission, type Rol } from "@/lib/rentamax/security";
import { useRentaStore } from "@/lib/rentamax/store";
import { cn } from "@/lib/utils";

const NAV: {
  to: "/dashboard" | "/inventario" | "/alquileres" | "/devoluciones" | "/seguridad" | "/ayuda";
  label: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
  group: "operacion" | "sistema";
}[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard", group: "operacion" },
  { to: "/inventario", label: "Inventario", icon: Boxes, permission: "inventario_ver", group: "operacion" },
  { to: "/alquileres", label: "Alquileres", icon: Truck, permission: "alquileres", group: "operacion" },
  { to: "/devoluciones", label: "Devoluciones", icon: ClipboardCheck, permission: "devoluciones", group: "operacion" },
  { to: "/seguridad", label: "Seguridad", icon: Shield, permission: "seguridad", group: "sistema" },
  { to: "/ayuda", label: "Ayuda", icon: CircleHelp, permission: "ayuda", group: "sistema" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function NavLinks({
  pathname,
  rol,
  onNavigate,
}: {
  pathname: string;
  rol?: Rol;
  onNavigate?: () => void;
}) {
  const items = NAV.filter((item) => can(rol, item.permission));
  const operacion = items.filter((i) => i.group === "operacion");
  const sistema = items.filter((i) => i.group === "sistema");

  function render(list: typeof items) {
    return list.map((item) => {
      const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
      const Icon = item.icon;
      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={cn(
            "flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold transition-colors duration-150",
            active
              ? "bg-brand text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]"
              : "text-navy-muted hover:bg-white/8 hover:text-navy-fg",
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
          {item.label}
        </Link>
      );
    });
  }

  return (
    <nav className="flex flex-col gap-4 px-3">
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-navy-muted uppercase">
          Operación
        </p>
        <div className="flex flex-col gap-1">{render(operacion)}</div>
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-navy-muted uppercase">
          Sistema
        </p>
        <div className="flex flex-col gap-1">{render(sistema)}</div>
      </div>
    </nav>
  );
}

export function AppShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useRentaStore((s) => s.session);
  const logout = useRentaStore((s) => s.logout);
  const resetDemo = useRentaStore((s) => s.resetDemo);
  const notice = useRentaStore((s) => s.notice);
  const clearNotice = useRentaStore((s) => s.clearNotice);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = can(session?.rol, "demo_reset");

  function handleLogout() {
    logout("Cierre de sesión");
    void navigate({ to: "/login" });
  }

  function handleReset() {
    if (
      !window.confirm(
        "Esto restaura inventario y alquileres de demostración. No borra la bitácora de seguridad. ¿Continuar?",
      )
    ) {
      return;
    }
    resetDemo();
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[248px_1fr]">
      <SessionWatch />
      <aside className="sticky top-0 hidden h-screen flex-col bg-navy text-navy-fg lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <Logo inverted />
        </div>
        <div className="flex-1 overflow-y-auto pt-2">
          <NavLinks pathname={pathname} rol={session?.rol} />
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-[12px] bg-white/8 px-3 py-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {session ? initials(session.nombre) : "RM"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {session?.nombre}
              </p>
              <p className="truncate text-[12px] text-navy-muted">
                {session ? roleLabel(session.rol) : ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-navy-deep/50"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-[min(86vw,280px)] flex-col bg-navy text-navy-fg shadow-soft">
            <div className="flex h-[64px] items-center justify-between px-4">
              <Logo inverted />
              <button
                className="flex size-11 items-center justify-center rounded-[10px] text-navy-fg"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              rol={session?.rol}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-[64px] items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:h-[72px]">
          <button
            className="flex size-11 items-center justify-center rounded-[10px] text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[1.15rem] font-bold tracking-tight text-ink sm:text-xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button variant="ghost" size="icon" asChild title="Ayuda">
              <Link to="/ayuda" aria-label="Abrir ayuda">
                <CircleHelp className="size-4" />
              </Link>
            </Button>
            {isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                className="max-sm:hidden text-muted"
                onClick={handleReset}
                title="Restablecer datos de demostración"
              >
                <RotateCcw className="size-3.5" />
                Demo
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </header>
        {notice ? (
          <div className="flex items-start justify-between gap-3 border-b border-warning/20 bg-warning-soft px-4 py-2.5 text-sm text-warning sm:px-6">
            <p>{notice}</p>
            <button
              className="shrink-0 font-semibold"
              onClick={clearNotice}
              aria-label="Cerrar aviso"
            >
              Cerrar
            </button>
          </div>
        ) : null}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
