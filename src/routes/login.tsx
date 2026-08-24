import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CircleHelp, Eye, EyeOff, Info } from "lucide-react";
import { Logo } from "@/components/Logo";
import { RedirectIfAuthed } from "@/components/RequireSession";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DEMO_USERS, useRentaStore } from "@/lib/rentamax/store";
import { roleLabel } from "@/lib/rentamax/security";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  return (
    <RedirectIfAuthed>
      <LoginPage />
    </RedirectIfAuthed>
  );
}

function LoginPage() {
  const login = useRentaStore((s) => s.login);
  const notice = useRentaStore((s) => s.notice);
  const clearNotice = useRentaStore((s) => s.clearNotice);
  const navigate = useNavigate();
  const [email, setEmail] = useState("carlos.mendoza@rentamax.pe");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [hint, setHint] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    clearNotice();
    if (!email.trim() || !password) {
      setError("Ingrese correo y contraseña.");
      setShake((n) => n + 1);
      return;
    }
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setShake((n) => n + 1);
      return;
    }
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 80% 70%, #fff 0 1px, transparent 1.5px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-7 flex justify-center">
          <div className="rounded-2xl bg-white px-5 py-3 shadow-soft">
            <Logo />
          </div>
        </div>
        <form
          onSubmit={(e) => void onSubmit(e)}
          className={cn(
            "rounded-[22px] bg-surface p-7 shadow-soft sm:p-8",
            error ? "rmx-shake" : "",
          )}
          key={shake}
        >
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Acceso por rol. Cada perfil solo ve lo que le corresponde.
          </p>

          {notice ? (
            <div
              role="status"
              className="mt-5 rounded-[12px] bg-warning-soft px-3.5 py-3 text-sm font-medium text-warning"
            >
              {notice}
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-5 rounded-[12px] bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                className="mt-1.5"
                type="email"
                autoComplete="username"
                placeholder="operador@rentamax.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 flex size-11 items-center justify-center text-muted hover:text-ink"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy ? "Verificando…" : "Iniciar sesión"}
          </Button>

          <button
            type="button"
            className="mt-4 w-full text-center text-sm font-medium text-muted hover:text-brand"
            onClick={() => setHint(true)}
          >
            ¿Olvidó su contraseña?
          </button>

          {hint ? (
            <p className="mt-3 rounded-[12px] bg-info-soft px-3.5 py-2.5 text-[13px] text-info">
              En producción el administrador restablece el acceso. En esta
              demostración use las cuentas de abajo. Tras 5 fallos la cuenta se
              bloquea 2 minutos.
            </p>
          ) : null}
        </form>

        <div className="mt-5 rounded-[16px] bg-navy/90 p-4 text-navy-fg shadow-soft">
          <p className="flex items-center gap-2 text-[12px] font-bold tracking-wide text-brand-ring uppercase">
            <Info className="size-3.5" /> Cuentas de demostración
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-navy-muted">
            {DEMO_USERS.map((u) => (
              <li key={u.email}>
                <button
                  type="button"
                  className="w-full rounded-[8px] px-1 py-1 text-left hover:bg-white/8"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(u.password);
                    setError(null);
                    clearNotice();
                  }}
                >
                  <span className="font-semibold text-navy-fg">{roleLabel(u.rol)}</span>
                  <span className="block text-[12px]">
                    {u.email}
                    <span className="text-navy-muted"> / {u.password}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center">
          <Link
            to="/login"
            onClick={(e) => {
              e.preventDefault();
              setHint(true);
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
          >
            <CircleHelp className="size-3.5" />
            Tras entrar, abra Ayuda (icono ?) para el recorrido y las soluciones.
          </Link>
        </p>
      </div>
    </div>
  );
}
