import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireRole } from "@/components/RequireRole";
import { Button } from "@/components/ui/button";
import { Input, SelectInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIAS, type Categoria, useRentaStore } from "@/lib/rentamax/store";

export const Route = createFileRoute("/_app/inventario/nuevo")({
  component: NuevoEquipoPage,
});

function NuevoEquipoPage() {
  return (
    <RequireRole permission="inventario_alta">
      <NuevoEquipoForm />
    </RequireRole>
  );
}

function NuevoEquipoForm() {
  const addEquipo = useRentaStore((s) => s.addEquipo);
  const nextEquipo = useRentaStore((s) => s.nextEquipo);
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [tarifa, setTarifa] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const tarifaDia = Number(tarifa.replace(",", "."));
    const result = addEquipo({
      nombre,
      categoria: categoria as Categoria,
      tarifaDia,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOk(result.message);
    window.setTimeout(() => {
      void navigate({ to: "/inventario" });
    }, 700);
  }

  const preview = `EQ-${String(nextEquipo).padStart(3, "0")}`;

  return (
    <AppShell title="Registrar equipo">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl rounded-[18px] bg-surface p-5 shadow-card sm:p-7"
      >
        <p className="text-sm text-muted">
          El código se genera automáticamente al guardar.
        </p>
        {error ? (
          <div role="alert" className="mt-4 rounded-[12px] bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
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
            <Label htmlFor="nombre">Nombre del equipo</Label>
            <Input
              id="nombre"
              className="mt-1.5"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Taladro Percutor Bosch"
              required
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <SelectInput
              id="categoria"
              className="mt-1.5"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              required
            >
              <option value="">Seleccione…</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <Label htmlFor="tarifa">Tarifa por día (S/)</Label>
            <Input
              id="tarifa"
              className="mt-1.5"
              inputMode="decimal"
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              placeholder="25.00"
              required
            />
          </div>
          <div>
            <Label>Código asignado</Label>
            <Input className="mt-1.5" value={preview} readOnly disabled />
          </div>
          <div>
            <Label>Estado inicial</Label>
            <Input className="mt-1.5" value="Disponible" readOnly disabled />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link to="/inventario">Cancelar</Link>
          </Button>
          <Button type="submit">Guardar equipo</Button>
        </div>
      </form>
    </AppShell>
  );
}
