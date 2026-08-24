import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { ScreenLoader } from "@/components/HydrateStore";
import { useRentaStore } from "@/lib/rentamax/store";

export function RequireSession({ children }: { children: ReactNode }) {
  const hydrated = useRentaStore((s) => s.hydrated);
  const session = useRentaStore((s) => s.session);
  if (!hydrated) return <ScreenLoader />;
  if (!session) return <Navigate to="/login" />;
  return children;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const hydrated = useRentaStore((s) => s.hydrated);
  const session = useRentaStore((s) => s.session);
  if (!hydrated) return <ScreenLoader />;
  if (session) return <Navigate to="/dashboard" />;
  return children;
}
