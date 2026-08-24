import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardCheck,
  PackageCheck,
  Plus,
  Timer,
  Truck,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AlquilerStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  rentalStatus,
  selectAlerts,
  selectKpis,
  useRentaStore,
  daysLate,
  type AlertItem,
} from "@/lib/rentamax/store";
import { can, formatDniForRole, roleLabel, roleSummary } from "@/lib/rentamax/security";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function formatDate(iso: string) {
  return format(parseISO(iso), "dd/MM/yyyy");
}

const kpisMeta = [
  { key: "total" as const, label: "Equipos", icon: Boxes, tone: "navy" },
  { key: "disponibles" as const, label: "Disponibles", icon: PackageCheck, tone: "teal" },
  { key: "alquilados" as const, label: "Alquilados", icon: Truck, tone: "warning" },
  { key: "mantenimiento" as const, label: "Mantenimiento", icon: Wrench, tone: "danger" },
  { key: "atrasados" as const, label: "Atrasados", icon: Timer, tone: "brand" },
];

const toneClass: Record<string, string> = {
  navy: "bg-navy text-white",
  teal: "bg-teal text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  brand: "bg-brand text-white",
};

function DashboardPage() {
  const equipos = useRentaStore((s) => s.equipos);
  const alquileres = useRentaStore((s) => s.alquileres);
  const rol = useRentaStore((s) => s.session?.rol);
  const nombre = useRentaStore((s) => s.session?.nombre);
  const canAlta = can(rol, "inventario_alta");
  const canFullKpi = can(rol, "kpis_completos");
  const kpis = selectKpis(equipos, alquileres);
  const alerts = selectAlerts(equipos, alquileres);
  const late = alquileres
    .filter((a) => rentalStatus(a) === "atrasado")
    .sort((a, b) => a.fin.localeCompare(b.fin));

  return (
    <AppShell
      title="Panel de control"
      actions={
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/alquileres/nuevo">
            <Plus className="size-3.5" /> Nuevo alquiler
          </Link>
        </Button>
      }
    >
      <div className="mb-5 rounded-[16px] border border-line bg-surface px-4 py-3.5 shadow-card sm:px-5">
        <p className="text-sm font-semibold text-ink">
          Hola {nombre?.split(" ")[0]}, {rol ? roleLabel(rol) : ""}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {rol ? roleSummary(rol) : ""} Abra{" "}
          <Link to="/ayuda" className="font-semibold text-brand">
            Ayuda
          </Link>{" "}
          si se pierde o aparece un error.
        </p>
      </div>
      <section className={`grid grid-cols-2 gap-3 ${canFullKpi ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        {kpisMeta
          .filter((k) => canFullKpi || k.key !== "mantenimiento")
          .map((k) => {
          const Icon = k.icon;
          return (
            <article
              key={k.key}
              className="rounded-[16px] bg-surface p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {k.label}
                </p>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-[10px]",
                    toneClass[k.tone],
                  )}
                >
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-tight tabular-nums text-ink">
                {kpis[k.key]}
              </p>
            </article>
          );
        })}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[18px] bg-surface p-5 shadow-card">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold text-ink">
              Alquileres atrasados
            </h2>
            <Link
              to="/alquileres"
              className="text-sm font-semibold text-brand hover:text-brand-hover"
            >
              Ver todos
            </Link>
          </div>
          {late.length === 0 ? (
            <p className="rounded-[12px] bg-success-soft px-4 py-6 text-center text-sm font-medium text-success">
              No hay alquileres atrasados.
            </p>
          ) : (
            <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold tracking-wide text-muted uppercase">
                    <th className="py-2 pr-3 font-semibold">N.º</th>
                    <th className="py-2 pr-3 font-semibold">Equipo</th>
                    <th className="py-2 pr-3 font-semibold">Cliente</th>
                    <th className="py-2 pr-3 font-semibold">Fin</th>
                    <th className="py-2 pr-3 font-semibold">Atraso</th>
                    <th className="py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {late.map((a) => {
                    const eq = equipos.find((e) => e.id === a.equipoId);
                    const lateDays = daysLate(a.fin);
                    return (
                      <tr key={a.id} className="border-b border-line/80 last:border-0">
                        <td className="py-3 pr-3 font-semibold text-navy">{a.codigo}</td>
                        <td className="py-3 pr-3">{eq?.nombre}</td>
                        <td className="py-3 pr-3">
                          {a.clienteNombre}
                          <span className="block text-xs text-muted">
                            DNI {formatDniForRole(a.clienteDni, rol)}
                          </span>
                        </td>
                        <td className="py-3 pr-3 tabular-nums">{formatDate(a.fin)}</td>
                        <td className="py-3 pr-3">
                          <AlquilerStatusBadge estado="atrasado" />
                          <span className="mt-1 block text-xs font-medium text-danger">
                            {lateDays} {lateDays === 1 ? "día" : "días"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to="/devoluciones/$id"
                            params={{ id: a.id }}
                            className="inline-flex h-9 items-center rounded-[10px] px-3 text-sm font-semibold text-brand hover:bg-brand-soft"
                          >
                            Devolver
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2.5 md:hidden">
              {late.map((a) => {
                const eq = equipos.find((e) => e.id === a.equipoId);
                const lateDays = daysLate(a.fin);
                return (
                  <li key={a.id} className="rounded-[14px] border border-line p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-navy">{a.codigo}</p>
                        <p className="font-semibold text-ink">{eq?.nombre}</p>
                        <p className="text-sm text-muted">
                          {a.clienteNombre} · {lateDays} {lateDays === 1 ? "día" : "días"}
                        </p>
                      </div>
                      <AlquilerStatusBadge estado="atrasado" />
                    </div>
                    <Link
                      to="/devoluciones/$id"
                      params={{ id: a.id }}
                      className="mt-2 inline-flex text-sm font-semibold text-brand"
                    >
                      Devolver
                    </Link>
                  </li>
                );
              })}
            </ul>
            </>
          )}
        </section>

        <section className="rounded-[18px] bg-surface p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">
            Alertas del día
          </h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted">Sin alertas por ahora.</p>
          ) : (
            <ul className="space-y-2.5">
              {alerts.map((a) => (
                <AlertRow key={a.id} alert={a} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Accesos rápidos
        </h2>
        <div className={`grid gap-3 ${canAlta ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {canAlta ? (
          <Link
            to="/inventario/nuevo"
            className="flex items-center gap-3 rounded-[16px] bg-surface p-4 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="flex size-11 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
              <Plus className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">Registrar equipo</span>
              <span className="block text-sm text-muted">Alta de inventario</span>
            </span>
          </Link>
          ) : null}
          <Link
            to="/alquileres/nuevo"
            className="flex items-center gap-3 rounded-[16px] bg-surface p-4 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="flex size-11 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
              <Truck className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">Nuevo alquiler</span>
              <span className="block text-sm text-muted">Cliente, equipo y fechas</span>
            </span>
          </Link>
          <Link
            to="/devoluciones"
            className="flex items-center gap-3 rounded-[16px] bg-surface p-4 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="flex size-11 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
              <ClipboardCheck className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">Registrar devolución</span>
              <span className="block text-sm text-muted">Cerrar un alquiler activo</span>
            </span>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const tone =
    alert.tone === "danger"
      ? "bg-danger-soft text-danger"
      : alert.tone === "warning"
        ? "bg-warning-soft text-warning"
        : "bg-info-soft text-info";
  const inner = (
    <div className="flex items-start gap-3 rounded-[14px] bg-canvas px-3.5 py-3">
      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px]", tone)}>
        <AlertTriangle className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{alert.title}</p>
        <p className="text-sm text-muted">{alert.detail}</p>
      </div>
      {alert.href ? <ArrowRight className="mt-1 size-4 shrink-0 text-muted" /> : null}
    </div>
  );

  if (alert.href?.startsWith("/devoluciones/")) {
    const id = alert.href.slice("/devoluciones/".length);
    return (
      <li>
        <Link to="/devoluciones/$id" params={{ id }} className="block hover:opacity-90">
          {inner}
        </Link>
      </li>
    );
  }
  if (alert.href === "/inventario") {
    return (
      <li>
        <Link to="/inventario" className="block hover:opacity-90">
          {inner}
        </Link>
      </li>
    );
  }
  return <li>{inner}</li>;
}
