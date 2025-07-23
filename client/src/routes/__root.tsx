import useCartSetup from "@/hooks/useCartSetup";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  useCartSetup();

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
