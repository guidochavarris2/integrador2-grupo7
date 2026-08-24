import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireRole } from "@/components/RequireRole";
import { useRentaStore, type AuditKind } from "@/lib/rentamax/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/seguridad")({
  component: () => (
    <RequireRole permission="seguridad">
      <SeguridadPage />
    </RequireRole>
  ),
});

const KIND_LABEL: Record<AuditKind, string> = {
  login_ok: "Acceso",
  login_fail: "Fallo de login",
  login_lock: "Bloqueo",
  logout: "Salida",
  session_expired: "Sesión caducada",
  acceso_denegado: "Denegado",
  equipo_alta: "Alta equipo",
  alquiler_alta: "Alquiler",
  devolucion: "Devolución",
  demo_reset: "Reset demo",
};

function SeguridadPage() {
  const audit = useRentaStore((s) => s.audit);
  const session = useRentaStore((s) => s.session);

  return (
    <AppShell title="Seguridad y bitácora">
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[16px] bg-navy p-5 text-navy-fg shadow-card">
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-brand-ring uppercase">
            <ShieldCheck className="size-3.5" /> Controles activos
          </p>
          <ul className="mt-3 space-y-2 text-sm text-navy-muted">
            <li>Autenticación con hash SHA-256 (sal + correo)</li>
            <li>Autorización por rol en UI y en cada acción</li>
            <li>Bloqueo 2 min tras 5 intentos (fuerza bruta)</li>
            <li>Sesión: 30 min inactividad / 8 h máximo</li>
            <li>Sanitización XSS en nombres y observaciones</li>
            <li>DNI enmascarado para el operador</li>
            <li>Comparación de hash en tiempo constante</li>
          </ul>
        </article>
        <article className="rounded-[16px] bg-surface p-5 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink">
            Sesión actual
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                Usuario
              </dt>
              <dd className="font-medium">{session?.nombre}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                Rol
              </dt>
              <dd className="font-medium">{session?.rol}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                Token de sesión
              </dt>
              <dd className="truncate font-mono text-[12px] text-ink-soft">
                {session?.token}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <section className="mt-5 rounded-[18px] bg-surface p-4 shadow-card sm:p-5">
        <h2 className="font-display text-lg font-bold text-ink">
          Bitácora de eventos
        </h2>
        <p className="mt-1 text-sm text-muted">
          Evidencia de autenticación, autorización y cambios. Útil para APF2 y
          el informe de seguridad.
        </p>
        {audit.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Aún no hay eventos. Inicie sesión, falle un login o registre un
            movimiento.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {audit.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold",
                      e.kind === "login_ok" ||
                        e.kind === "equipo_alta" ||
                        e.kind === "alquiler_alta" ||
                        e.kind === "devolucion"
                        ? "bg-success-soft text-success"
                        : e.kind === "acceso_denegado" ||
                            e.kind === "login_fail" ||
                            e.kind === "login_lock"
                          ? "bg-danger-soft text-danger"
                          : "bg-info-soft text-info",
                    )}
                  >
                    {KIND_LABEL[e.kind]}
                  </span>
                  <p className="mt-1 text-sm font-medium text-ink">{e.detail}</p>
                  <p className="text-[12px] text-muted">
                    {e.actor}
                    {e.rol ? ` · ${e.rol}` : ""}
                  </p>
                </div>
                <time className="shrink-0 text-[12px] tabular-nums text-muted">
                  {e.at.replace("T", " ").slice(0, 19)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
