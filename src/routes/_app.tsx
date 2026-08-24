import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <RequireSession>
      <Outlet />
    </RequireSession>
  );
}
