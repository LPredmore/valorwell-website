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

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SitewideFormTrackingManager />
          <ClientIntakeRoutingManager />
          <DonationAttributionManager />
          <RouteScrollManager />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
