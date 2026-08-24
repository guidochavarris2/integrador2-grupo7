import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/alquileres")({
  component: () => <Outlet />,
});
