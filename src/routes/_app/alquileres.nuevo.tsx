import { useMemo, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input, SelectInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { daysBetween, todayIso, useRentaStore } from "@/lib/rentamax/store";
import { formatDni, formatSoles } from "@/lib/utils";

type Search = { equipo?: string };

export const Route = createFileRoute("/_app/alquileres/nuevo")({
  component: NuevoAlquilerPage,
  validateSearch: (search: Record<string, unknown>): Search => ({
    equipo: typeof search.equipo === "string" ? search.equipo : undefined,
  }),
});

function NuevoAlquilerPage() {
  const { equipo: preselect } = Route.useSearch();
  const addAlquiler = useRentaStore((s) => s.addAlquiler);
  const equipos = useRentaStore((s) => s.equipos);
  const nextAlquiler = useRentaStore((s) => s.nextAlquiler);
  const navigate = useNavigate();

  const disponibles = equipos.filter((e) => e.estado === "disponible");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDni, setClienteDni] = useState("");
  const [equipoId, setEquipoId] = useState(preselect && disponibles.some((e) => e.id === preselect) ? preselect : "");
  const [inicio, setInicio] = useState(todayIso());
  const [fin, setFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const equipo = equipos.find((e) => e.id === equipoId);
  const summary = useMemo(() => {
    if (!inicio || !fin || !equipo) return null;
    if (fin < inicio) return null;
    const dias = daysBetween(inicio, fin);
    return { dias, tarifa: equipo.tarifaDia, total: dias * equipo.tarifaDia };
  }, [inicio, fin, equipo]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = addAlquiler({
      equipoId,
      clienteNombre,
      clienteDni,
      inicio,
      fin,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOk(result.message);
    window.setTimeout(() => {
      void navigate({ to: "/alquileres" });
    }, 700);
  }

  const preview = `ALQ-${String(nextAlquiler).padStart(3, "0")}`;

  return (
    <AppShell title="Nuevo alquiler">
      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="rounded-[18px] bg-surface p-5 shadow-card sm:p-7">
          <p className="text-sm text-muted">
            Solo se listan equipos disponibles. El sistema bloquea cruces de fechas.
          </p>
          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-[12px] bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger"
            >
              {error}
            </div>
          ) : null}
          {ok ? (
            <div className="mt-4 rounded-[12px] bg-success-soft px-3.5 py-3 text-sm font-medium text-success">
              {ok}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="cliente">Nombre del cliente</Label>
              <Input
                id="cliente"
                className="mt-1.5"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div>
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                className="mt-1.5"
                inputMode="numeric"
                maxLength={8}
                value={clienteDni}
                onChange={(e) => setClienteDni(formatDni(e.target.value))}
                placeholder="45678912"
                required
              />
              {clienteDni.length > 0 && clienteDni.length !== 8 ? (
                <p className="mt-1.5 text-sm font-medium text-danger">
                  El DNI debe tener 8 dígitos.
                </p>
              ) : null}
            </div>
            <div>
              <Label>N.º de alquiler</Label>
              <Input className="mt-1.5" value={preview} readOnly disabled />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="equipo">Equipo</Label>
              <SelectInput
                id="equipo"
                className="mt-1.5"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                required
              >
                <option value="">Seleccione un equipo disponible…</option>
                {disponibles.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.codigo} · {e.nombre} · {formatSoles(e.tarifaDia)}/día
                  </option>
                ))}
              </SelectInput>
              {disponibles.length === 0 ? (
                <p className="mt-1.5 text-sm text-warning">
                  No hay equipos disponibles. Registre o libere inventario.
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="inicio">Fecha de inicio</Label>
              <Input
                id="inicio"
                type="date"
                className="mt-1.5"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="fin">Fecha de fin</Label>
              <Input
                id="fin"
                type="date"
                className="mt-1.5"
                value={fin}
                min={inicio}
                onChange={(e) => setFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" asChild>
              <Link to="/alquileres">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={disponibles.length === 0}>
              Registrar alquiler
            </Button>
          </div>
        </div>

        <aside className="h-fit rounded-[18px] bg-navy p-5 text-navy-fg shadow-card sm:p-6">
          <h2 className="font-display text-lg font-bold">Resumen</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-navy-muted">Equipo</dt>
              <dd className="text-right font-medium">
                {equipo ? equipo.nombre : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-navy-muted">Tarifa / día</dt>
              <dd className="tabular-nums">
                {equipo ? formatSoles(equipo.tarifaDia) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-navy-muted">Días</dt>
              <dd className="tabular-nums">{summary?.dias ?? "—"}</dd>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between gap-3">
                <dt className="font-semibold">Total estimado</dt>
                <dd className="font-display text-xl font-extrabold tabular-nums text-white">
                  {summary ? formatSoles(summary.total) : "S/ 0.00"}
                </dd>
              </div>
            </div>
          </dl>
        </aside>
      </form>
    </AppShell>
  );
}
