import { Badge } from "@/components/ui/badge";
import type { EquipoEstado } from "@/lib/rentamax/store";

const equipoLabels: Record<EquipoEstado, { label: string; tone: "success" | "warning" | "danger" | "muted" }> = {
  disponible: { label: "Disponible", tone: "success" },
  alquilado: { label: "Alquilado", tone: "warning" },
  mantenimiento: { label: "Mantenimiento", tone: "danger" },
  baja: { label: "Baja", tone: "muted" },
};

export function EquipoStatusBadge({ estado }: { estado: EquipoEstado }) {
  const { label, tone } = equipoLabels[estado];
  return <Badge tone={tone}>{label}</Badge>;
}

export function AlquilerStatusBadge({
  estado,
}: {
  estado: "activo" | "atrasado" | "cerrado";
}) {
  if (estado === "atrasado") return <Badge tone="danger">Atrasado</Badge>;
  if (estado === "cerrado") return <Badge tone="muted">Cerrado</Badge>;
  return <Badge tone="success">Activo</Badge>;
}
