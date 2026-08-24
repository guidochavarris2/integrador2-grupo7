import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DEMO_WALKTHROUGH,
  HELP_TOPICS,
  NAV_GUIDE,
  ROLE_GUIDE,
} from "@/lib/rentamax/help";
import { roleLabel, roleSummary, type Rol } from "@/lib/rentamax/security";
import { cn } from "@/lib/utils";

const ROLES: Rol[] = ["Operador", "Supervisora", "Administrador"];

export function HelpBody({ rol }: { rol?: Rol | null }) {
  const [open, setOpen] = useState<string | null>("login");
  const topics = useMemo(() => {
    return HELP_TOPICS.filter((t) => !t.roles || (rol && t.roles.includes(rol)));
  }, [rol]);

  return (
    <div className="space-y-6">
      <section className="rounded-[18px] bg-navy p-5 text-navy-fg shadow-card sm:p-6">
        <p className="text-[11px] font-bold tracking-[0.14em] text-brand-ring uppercase">
          Cómo moverse
        </p>
        <h2 className="mt-1 font-display text-xl font-bold">
          Recorrido de RentaMax
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {NAV_GUIDE.map((step) => (
            <li
              key={step.title}
              className="rounded-[14px] bg-white/8 px-3.5 py-3"
            >
              <p className="text-sm font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-navy-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {rol ? (
        <section className="rounded-[18px] border border-brand/20 bg-brand-soft p-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-brand uppercase">
            Su perfil
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-ink">
            {roleLabel(rol)}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">{roleSummary(rol)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-wide text-success uppercase">
                Puede ver y hacer
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-ink">
                {ROLE_GUIDE[rol].sees.map((x) => (
                  <li key={x}>· {x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-danger uppercase">
                No aparece en su menú
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-ink">
                {ROLE_GUIDE[rol].hidden.map((x) => (
                  <li key={x}>· {x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[18px] bg-surface p-5 shadow-card">
        <h3 className="font-display text-lg font-bold text-ink">
          Problemas y cómo resolverlos
        </h3>
        <p className="mt-1 text-sm text-muted">
          Abra el caso que le aparece en pantalla.
        </p>
        <ul className="mt-4 divide-y divide-line">
          {topics.map((topic) => {
            const isOpen = open === topic.id;
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 py-3.5 text-left"
                  onClick={() => setOpen(isOpen ? null : topic.id)}
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {topic.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {topic.problem}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-1 size-4 shrink-0 text-muted transition-transform",
                      isOpen ? "rotate-180" : "",
                    )}
                  />
                </button>
                {isOpen ? (
                  <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-ink-soft">
                    {topic.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-[18px] bg-surface p-5 shadow-card">
        <h3 className="font-display text-lg font-bold text-ink">
          Guion para demostrar al docente
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          {DEMO_WALKTHROUGH.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-[18px] bg-surface p-5 shadow-card">
        <h3 className="font-display text-lg font-bold text-ink">
          Los tres roles
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {ROLES.map((r) => (
            <article
              key={r}
              className={cn(
                "rounded-[14px] border p-3.5",
                rol === r ? "border-brand bg-brand-soft" : "border-line",
              )}
            >
              <p className="text-sm font-bold text-ink">{roleLabel(r)}</p>
              <p className="mt-1 text-[13px] text-muted">{roleSummary(r)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
