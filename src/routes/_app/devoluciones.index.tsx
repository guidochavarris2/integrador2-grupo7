import { Link, createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { AlquilerStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { daysLate, rentalStatus, useRentaStore } from "@/lib/rentamax/store";
import { formatDniForRole } from "@/lib/rentamax/security";

export const Route = createFileRoute("/_app/devoluciones/")({
  component: DevolucionesPage,
});

function DevolucionesPage() {
  const alquileres = useRentaStore((s) => s.alquileres);
  const equipos = useRentaStore((s) => s.equipos);
  const rol = useRentaStore((s) => s.session?.rol);
  const pending = alquileres
    .filter((a) => a.estado === "activo")
    .sort((a, b) => a.fin.localeCompare(b.fin));

  return (
    <AppShell title="Devoluciones">
      <div className="rounded-[18px] bg-surface p-4 shadow-card sm:p-5">
        <p className="text-sm text-muted">
          Seleccione un alquiler activo o atrasado para registrar la devolución.
        </p>
        {pending.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No hay alquileres pendientes de devolución.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {pending.map((a) => {
              const eq = equipos.find((e) => e.id === a.equipoId);
              const status = rentalStatus(a);
              const late = daysLate(a.fin);
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-navy">{a.codigo}</span>
                      <AlquilerStatusBadge estado={status} />
                    </div>
                    <p className="mt-1 font-semibold text-ink">{eq?.nombre}</p>
                    <p className="text-[13px] text-muted">
                      {a.clienteNombre} · DNI {formatDniForRole(a.clienteDni, rol)} · Fin{" "}
                      {format(parseISO(a.fin), "dd/MM/yyyy")}
                      {late > 0
                        ? ` · ${late} ${late === 1 ? "día" : "días"} de atraso`
                        : ""}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/devoluciones/$id" params={{ id: a.id }}>
                      Registrar devolución
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
