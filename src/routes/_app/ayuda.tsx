import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HelpBody } from "@/components/HelpBody";
import { useRentaStore } from "@/lib/rentamax/store";

export const Route = createFileRoute("/_app/ayuda")({
  component: AyudaPage,
});

function AyudaPage() {
  const rol = useRentaStore((s) => s.session?.rol);
  return (
    <AppShell title="Ayuda y soluciones">
      <p className="mb-5 max-w-3xl text-sm text-muted">
        Guía de navegación, qué ve cada rol y cómo resolver los errores más
        comunes (login, DNI, permisos, cruces de fechas y devoluciones).
      </p>
      <HelpBody rol={rol} />
    </AppShell>
  );
}
