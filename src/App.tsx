import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteScrollManager } from "@/components/routing/RouteScrollManager";
import { DonationAttributionManager } from "@/components/routing/DonationAttributionManager";
import { ClientIntakeRoutingManager } from "@/components/routing/ClientIntakeRoutingManager";
import { SitewideFormTrackingManager } from "@/components/routing/SitewideFormTrackingManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppRoutes } from "./AppRoutes";

const browserQueryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
  queryClient?: QueryClient;
  helmetContext?: Record<string, unknown>;
};

/**
 * Shared application providers used by both the browser and the build-time
 * renderer. Keeping these DOM-producing providers in one place prevents the
 * server markup from drifting away from the tree React hydrates in production.
 */
export function AppProviders({
  children,
  queryClient = browserQueryClient,
  helmetContext,
}: AppProvidersProps) {
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

/**
 * Router-owned behavior shared by BrowserRouter and StaticRouter. The manager
 * components render no DOM; their browser work runs after hydration in effects.
 */
export function AppRouterContent() {
  return (
    <>
      <SitewideFormTrackingManager />
      <ClientIntakeRoutingManager />
      <DonationAttributionManager />
      <RouteScrollManager />
      <AppRoutes />
    </>
  );
}

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <AppRouterContent />
    </BrowserRouter>
  </AppProviders>
);

export default App;
