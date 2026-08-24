import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EquipoStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type EquipoEstado, useRentaStore } from "@/lib/rentamax/store";
import { can } from "@/lib/rentamax/security";
import { cn, formatSoles } from "@/lib/utils";

export const Route = createFileRoute("/_app/inventario/")({
  component: InventarioPage,
});

const FILTERS: { id: "todos" | EquipoEstado; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "disponible", label: "Disponible" },
  { id: "alquilado", label: "Alquilado" },
  { id: "mantenimiento", label: "Mantenimiento" },
];

function InventarioPage() {
  const equipos = useRentaStore((s) => s.equipos);
  const rol = useRentaStore((s) => s.session?.rol);
  const canAlta = can(rol, "inventario_alta");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return equipos.filter((e) => {
      if (e.estado === "baja") return false;
      if (filter !== "todos" && e.estado !== filter) return false;
      if (!query) return true;
      return (
        e.codigo.toLowerCase().includes(query) ||
        e.nombre.toLowerCase().includes(query) ||
        e.categoria.toLowerCase().includes(query)
      );
    });
  }, [equipos, q, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <AppShell
      title="Inventario de equipos"
      actions={
        canAlta ? (
          <Button asChild size="sm">
            <Link to="/inventario/nuevo">
              <Plus className="size-3.5" /> Registrar equipo
            </Link>
          </Button>
        ) : (
          <p className="hidden text-[12px] text-muted sm:block">Solo consulta</p>
        )
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
              placeholder="Buscar por código, nombre o categoría"
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[12px] font-semibold tracking-wide text-muted uppercase">
                <th className="py-2.5 pr-3">Código</th>
                <th className="py-2.5 pr-3">Nombre</th>
                <th className="py-2.5 pr-3">Categoría</th>
                <th className="py-2.5 pr-3">Tarifa / día</th>
                <th className="py-2.5 pr-3">Estado</th>
                <th className="py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((e) => (
                <tr key={e.id} className="border-b border-line/80 last:border-0">
                  <td className="py-3 pr-3 font-semibold text-navy">{e.codigo}</td>
                  <td className="py-3 pr-3">{e.nombre}</td>
                  <td className="py-3 pr-3 text-ink-soft">{e.categoria}</td>
                  <td className="py-3 pr-3 tabular-nums">{formatSoles(e.tarifaDia)}</td>
                  <td className="py-3 pr-3">
                    <EquipoStatusBadge estado={e.estado} />
                  </td>
                  <td className="py-3">
                    {e.estado === "disponible" ? (
                      <Link
                        to="/alquileres/nuevo"
                        search={{ equipo: e.id }}
                        className="text-[13px] font-semibold text-brand hover:text-brand-hover"
                      >
                        Alquilar
                      </Link>
                    ) : (
                      <span className="text-[13px] text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-4 space-y-2.5 md:hidden">
          {slice.map((e) => (
            <li key={e.id} className="rounded-[14px] border border-line p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] font-bold text-navy">{e.codigo}</p>
                  <p className="font-semibold text-ink">{e.nombre}</p>
                  <p className="text-[13px] text-muted">
                    {e.categoria} · {formatSoles(e.tarifaDia)} / día
                  </p>
                </div>
                <EquipoStatusBadge estado={e.estado} />
              </div>
              {e.estado === "disponible" ? (
                <Link
                  to="/alquileres/nuevo"
                  search={{ equipo: e.id }}
                  className="mt-2 inline-flex text-sm font-semibold text-brand"
                >
                  Alquilar
                </Link>
              ) : null}
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No hay equipos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="mt-4 flex items-center justify-between text-[13px] text-muted">
            <span>
              {filtered.length} equipo{filtered.length === 1 ? "" : "s"}
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
