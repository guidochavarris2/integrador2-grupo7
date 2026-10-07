import { useState } from "react";
import { CheckCircle2, Loader2, PlayCircle, XCircle } from "lucide-react";
import { API_CONFIGURED, API_URL, ApiError, apiRequest } from "@/lib/rentamax/api";
import { useRentaStore } from "@/lib/rentamax/store";
import { cn } from "@/lib/utils";

type Row = {
  name: string;
  detail: string;
  expected: number;
  status: number | null;
  ms: number | null;
  error?: string;
};

/**
 * Verificacion en vivo contra el backend publicado: sirve de evidencia para el APF2
 * (JWT, cabecera Bearer, 401 sin token / con token alterado, tiempos de respuesta).
 * Solo se muestra al Administrador dentro de la pantalla Seguridad.
 */
export function BackendCheck() {
  const session = useRentaStore((s) => s.session);
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    if (!session) return;
    setRunning(true);
    const token = session.token;
    // Token alterado: se cambia el ultimo caracter de la firma, por lo que ya no coincide.
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");

    const plan: Omit<Row, "status" | "ms" | "error">[] = [
      { name: "GET /api/health", detail: "Sin token (ruta pública)", expected: 200 },
      { name: "GET /api/equipos", detail: "Sin token", expected: 401 },
      { name: "GET /api/equipos", detail: "Con Authorization: Bearer <JWT>", expected: 200 },
      { name: "GET /api/equipos", detail: "Con token alterado", expected: 401 },
      { name: "GET /api/admin/usuarios", detail: "Con JWT de Administrador", expected: 200 },
    ];
    const calls: Array<() => ReturnType<typeof apiRequest>> = [
      () => apiRequest("/api/health"),
      () => apiRequest("/api/equipos"),
      () => apiRequest("/api/equipos", { token }),
      () => apiRequest("/api/equipos", { token: tampered }),
      () => apiRequest("/api/admin/usuarios", { token }),
    ];

    const out: Row[] = plan.map((p) => ({ ...p, status: null, ms: null }));
    setRows([...out]);
    for (let i = 0; i < calls.length; i++) {
      try {
        const res = await calls[i]();
        out[i] = { ...out[i], status: res.status, ms: res.ms };
      } catch (err) {
        out[i] = {
          ...out[i],
          error: err instanceof ApiError ? err.message : "Error de red",
        };
      }
      setRows([...out]);
    }
    setRunning(false);
  }

  return (
    <section className="mt-5 rounded-[18px] bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Verificación en vivo del backend
          </h2>
          <p className="mt-1 text-sm text-muted">
            Llama al API publicado con y sin token. Muestra el código HTTP y el tiempo de
            cada respuesta.
          </p>
          <p className="mt-1 truncate font-mono text-[12px] text-ink-soft">
            {API_CONFIGURED ? API_URL : "VITE_API_URL sin configurar"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={running || !API_CONFIGURED}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {running ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <PlayCircle className="size-4" />
          )}
          {running ? "Verificando…" : "Ejecutar verificación"}
        </button>
      </div>

      {rows.length > 0 ? (
        <ul className="mt-4 divide-y divide-line">
          {rows.map((r, i) => {
            const done = r.status !== null || r.error !== undefined;
            const pass = r.status === r.expected;
            return (
              <li
                key={i}
                className="flex items-start justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[13px] font-semibold text-ink">{r.name}</p>
                  <p className="text-[12px] text-muted">
                    {r.detail} · esperado {r.expected}
                  </p>
                  {r.error ? (
                    <p className="text-[12px] text-danger">{r.error}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2 tabular-nums">
                  {!done ? (
                    <Loader2 className="size-4 animate-spin text-muted" />
                  ) : (
                    <>
                      <span className="text-[12px] text-muted">
                        {r.ms !== null ? `${r.ms} ms` : ""}
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          pass ? "text-success" : "text-danger",
                        )}
                      >
                        {r.status ?? "—"}
                      </span>
                      {pass ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <XCircle className="size-4 text-danger" />
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
