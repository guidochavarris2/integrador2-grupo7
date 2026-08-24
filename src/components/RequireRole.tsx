import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/lib/rentamax/security";
import { can, roleLabel } from "@/lib/rentamax/security";
import { useRentaStore, type Rol } from "@/lib/rentamax/store";
import { useEffect } from "react";

export function RequireRole({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const session = useRentaStore((s) => s.session);
  const deny = useRentaStore((s) => s.deny);
  const allowed = can(session?.rol, permission);

  useEffect(() => {
    if (session && !allowed) {
      deny(`Intento de acceder a “${permission}” con rol ${session.rol}`);
    }
  }, [allowed, deny, permission, session]);

  if (allowed) return children;
  return <Forbidden rol={session?.rol} />;
}

function Forbidden({ rol }: { rol?: Rol }) {
  return (
    <AppShell title="Acceso restringido">
      <div className="mx-auto max-w-lg rounded-[18px] bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-danger-soft text-danger">
          <ShieldOff className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-ink">
          Esta pantalla no corresponde a su rol
        </h2>
        <p className="mt-2 text-sm text-muted">
          Está conectado como{" "}
          <strong className="text-ink">{rol ? roleLabel(rol) : "invitado"}</strong>.
          El menú solo muestra lo que su perfil puede operar. Si necesita otra
          función, cierre sesión y entre con el usuario adecuado.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/dashboard">Volver al panel</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/ayuda">Ver qué puede hacer cada rol</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
