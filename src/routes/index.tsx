import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ScreenLoader } from "@/components/HydrateStore";
import { useRentaStore } from "@/lib/rentamax/store";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const hydrated = useRentaStore((s) => s.hydrated);
  const session = useRentaStore((s) => s.session);
  if (!hydrated) return <ScreenLoader />;
  return <Navigate to={session ? "/dashboard" : "/login"} />;
}
