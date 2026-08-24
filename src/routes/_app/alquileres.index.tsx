import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AlquilerStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rentalStatus, useRentaStore } from "@/lib/rentamax/store";
import { formatDniForRole } from "@/lib/rentamax/security";
import { cn, formatSoles } from "@/lib/utils";

export const Route = createFileRoute("/_app/alquileres/")({
  component: AlquileresPage,
});

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "activo", label: "Activo" },
  { id: "atrasado", label: "Atrasado" },
  { id: "cerrado", label: "Cerrado" },
] as const;

function AlquileresPage() {
  const alquileres = useRentaStore((s) => s.alquileres);
  const equipos = useRentaStore((s) => s.equipos);
  const rol = useRentaStore((s) => s.session?.rol);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return alquileres.filter((a) => {
      const status = rentalStatus(a);
      if (filter !== "todos" && status !== filter) return false;
      if (!query) return true;
      const eq = equipos.find((e) => e.id === a.equipoId);
      return (
        a.codigo.toLowerCase().includes(query) ||
        a.clienteNombre.toLowerCase().includes(query) ||
        a.clienteDni.includes(query) ||
        (eq?.nombre.toLowerCase().includes(query) ?? false) ||
        (eq?.codigo.toLowerCase().includes(query) ?? false)
      );
    });
  }, [alquileres, equipos, q, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <AppShell
      title="Alquileres"
      actions={
        <Button asChild size="sm">
          <Link to="/alquileres/nuevo">
            <Plus className="size-3.5" /> Nuevo alquiler
          </Link>
        </Button>
      }
    >
      <div className="rounded-[18px] bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar por código, cliente, DNI o equipo"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(0);
                }}
                className={cn(
                  "h-10 rounded-full px-3.5 text-[13px] font-semibold",
                  filter === f.id
                    ? "bg-navy text-white"
                    : "bg-canvas text-ink-soft hover:bg-line",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[12px] font-semibold tracking-wide text-muted uppercase">
                <th className="py-2.5 pr-3">N.º</th>
                <th className="py-2.5 pr-3">Equipo</th>
                <th className="py-2.5 pr-3">Cliente</th>
                <th className="py-2.5 pr-3">Inicio</th>
                <th className="py-2.5 pr-3">Fin</th>
                <th className="py-2.5 pr-3">Total</th>
                <th className="py-2.5 pr-3">Estado</th>
                <th className="py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((a) => {
                const eq = equipos.find((e) => e.id === a.equipoId);
                const status = rentalStatus(a);
                return (
                  <tr key={a.id} className="border-b border-line/80 last:border-0">
                    <td className="py-3 pr-3 font-semibold text-navy">{a.codigo}</td>
                    <td className="py-3 pr-3">
                      {eq?.nombre}
                      <span className="block text-[12px] text-muted">{eq?.codigo}</span>
                    </td>
                    <td className="py-3 pr-3">
                      {a.clienteNombre}
                      <span className="block text-[12px] text-muted">
                        DNI {formatDniForRole(a.clienteDni, rol)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 tabular-nums">
                      {format(parseISO(a.inicio), "dd/MM/yyyy")}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">
                      {format(parseISO(a.fin), "dd/MM/yyyy")}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{formatSoles(a.total)}</td>
                    <td className="py-3 pr-3">
                      <AlquilerStatusBadge estado={status} />
                    </td>
                    <td className="py-3">
                      {status === "cerrado" ? (
                        <span className="text-[13px] text-muted">Cerrado</span>
                      ) : (
                        <Link
                          to="/devoluciones/$id"
                          params={{ id: a.id }}
                          className="text-[13px] font-semibold text-brand hover:text-brand-hover"
                        >
                          Devolver
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="mt-4 space-y-2.5 md:hidden">
          {slice.map((a) => {
            const eq = equipos.find((e) => e.id === a.equipoId);
            const status = rentalStatus(a);
            return (
              <li key={a.id} className="rounded-[14px] border border-line p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-bold text-navy">{a.codigo}</p>
                    <p className="font-semibold text-ink">{eq?.nombre}</p>
                    <p className="text-[13px] text-muted">
                      {a.clienteNombre} · DNI {formatDniForRole(a.clienteDni, rol)}
                    </p>
                  </div>
                  <AlquilerStatusBadge estado={status} />
                </div>
                {status !== "cerrado" ? (
                  <Link
                    to="/devoluciones/$id"
                    params={{ id: a.id }}
                    className="mt-2 inline-flex text-[13px] font-semibold text-brand"
                  >
                    Devolver
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No hay alquileres que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="mt-4 flex items-center justify-between text-[13px] text-muted">
            <span>
              {filtered.length} registro{filtered.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Anterior
              </Button>
              <span className="tabular-nums">
                {safePage + 1} / {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= pages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
