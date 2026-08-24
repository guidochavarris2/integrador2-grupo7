import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { AlquilerStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  daysLate,
  rentalStatus,
  type CondicionDevolucion,
  useRentaStore,
} from "@/lib/rentamax/store";
import { cn, formatSoles } from "@/lib/utils";
import { formatDniForRole } from "@/lib/rentamax/security";

export const Route = createFileRoute("/_app/devoluciones/$id")({
  component: DevolucionPage,
});

const CONDICIONES: { id: CondicionDevolucion; label: string; hint: string }[] = [
  { id: "bueno", label: "Bueno", hint: "El equipo vuelve a inventario disponible." },
  { id: "danado", label: "Dañado", hint: "Pasa a mantenimiento. Observaciones obligatorias." },
  { id: "perdido", label: "Perdido", hint: "Se da de baja. Observaciones obligatorias." },
];

function DevolucionPage() {
  const { id } = Route.useParams();
  const alquiler = useRentaStore((s) => s.alquileres.find((a) => a.id === id));
  const equipo = useRentaStore((s) =>
    alquiler ? s.equipos.find((e) => e.id === alquiler.equipoId) : undefined,
  );
  const devolver = useRentaStore((s) => s.devolver);
  const rol = useRentaStore((s) => s.session?.rol);
  const navigate = useNavigate();
  const [condicion, setCondicion] = useState<CondicionDevolucion>("bueno");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (!alquiler || !equipo) {
    return (
      <AppShell title="Registrar devolución">
        <div className="rounded-[18px] bg-surface p-8 text-center shadow-card">
          <p className="font-semibold text-ink">No se encontró el alquiler.</p>
          <Button asChild className="mt-4">
            <Link to="/devoluciones">Volver al listado</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const rental = alquiler;
  const gear = equipo;
  const status = rentalStatus(rental);
  const late = daysLate(rental.fin);
  const closed = rental.estado === "cerrado";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = devolver({
      alquilerId: rental.id,
      condicion,
      observaciones,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOk(result.message);
    window.setTimeout(() => {
      void navigate({ to: "/dashboard" });
    }, 800);
  }

  return (
    <AppShell title="Registrar devolución">
      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1.15fr_1fr]"
      >
        <section className="rounded-[18px] bg-surface p-5 shadow-card sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink">{alquiler.codigo}</h2>
            <AlquilerStatusBadge estado={status} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[12px] font-semibold tracking-wide text-muted uppercase">
                Equipo
              </dt>
              <dd className="mt-0.5 font-semibold">
                {equipo.codigo} · {equipo.nombre}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-wide text-muted uppercase">
                Cliente
              </dt>
              <dd className="mt-0.5 font-semibold">
                {alquiler.clienteNombre}
                <span className="block font-normal text-muted">
                  DNI {formatDniForRole(alquiler.clienteDni, rol)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-wide text-muted uppercase">
                Periodo
              </dt>
              <dd className="mt-0.5 tabular-nums">
                {format(parseISO(alquiler.inicio), "dd/MM/yyyy")} —{" "}
                {format(parseISO(alquiler.fin), "dd/MM/yyyy")}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold tracking-wide text-muted uppercase">
                Total
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {formatSoles(alquiler.total)} · {alquiler.dias} días
              </dd>
            </div>
          </dl>
          {late > 0 && !closed ? (
            <p className="mt-4 rounded-[12px] bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
              Atrasado {late} {late === 1 ? "día" : "días"} respecto a la fecha de fin.
            </p>
          ) : null}
          {closed ? (
            <p className="mt-4 rounded-[12px] bg-canvas px-3.5 py-3 text-sm text-muted">
              Este alquiler ya fue cerrado
              {alquiler.devueltoEn
                ? ` el ${format(parseISO(alquiler.devueltoEn), "dd/MM/yyyy")}`
                : ""}
              .
            </p>
          ) : null}
        </section>

        <section className="rounded-[18px] bg-surface p-5 shadow-card sm:p-7">
          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-[12px] bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger"
            >
              {error}
            </div>
          ) : null}
          {ok ? (
            <div className="mb-4 rounded-[12px] bg-success-soft px-3.5 py-3 text-sm font-medium text-success">
              {ok}
            </div>
          ) : null}

          <fieldset disabled={closed} className="disabled:opacity-70">
            <legend className="text-[13px] font-semibold text-ink-soft">
              Estado del equipo
            </legend>
            <div className="mt-3 grid gap-2">
              {CONDICIONES.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[14px] border px-3.5 py-3",
                    condicion === c.id
                      ? "border-brand bg-brand-soft"
                      : "border-line hover:bg-canvas",
                  )}
                >
                  <input
                    type="radio"
                    name="condicion"
                    className="mt-1 accent-[var(--color-brand)]"
                    checked={condicion === c.id}
                    onChange={() => setCondicion(c.id)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{c.label}</span>
                    <span className="block text-[12px] text-muted">{c.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-5">
              <Label htmlFor="obs">
                Observaciones
                {condicion !== "bueno" ? " (obligatorias)" : " (opcional)"}
              </Label>
              <Textarea
                id="obs"
                className="mt-1.5"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder={
                  condicion === "bueno"
                    ? "Sin observaciones"
                    : "Describa el daño o la pérdida"
                }
              />
            </div>
          </fieldset>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" asChild>
              <Link to="/devoluciones">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={closed}>
              {condicion === "bueno"
                ? "Devolver sin observaciones"
                : "Registrar devolución"}
            </Button>
          </div>
        </section>
      </form>
    </AppShell>
  );
}
