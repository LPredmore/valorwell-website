import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteScrollManager } from "@/components/routing/RouteScrollManager";
import { DonationAttributionManager } from "@/components/routing/DonationAttributionManager";
import { ClientIntakeRoutingManager } from "@/components/routing/ClientIntakeRoutingManager";
import { SitewideFormTrackingManager } from "@/components/routing/SitewideFormTrackingManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Preserved functional (non-shell) routes
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import WatchPage from "./pages/WatchPage";
import NetworkPage from "./pages/NetworkPage";
import MissionPage from "./pages/MissionPage";
import AboutPage from "./pages/AboutPage";
import ImpactPage from "./pages/ImpactPage";
import DonatePage from "./pages/DonatePage";
import BtyBillingHubPage from "./pages/BtyBillingHubPage";
import Clinicians from "./pages/Clinicians";
import GetCareWithSignup from "./pages/GetCareWithSignup";
import Partner from "./pages/Partner";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Pendulo from "./pages/Pendulo";
import GallantFewPage from "./pages/bty/GallantFewPage";
import VeteransOutreachWisconsinPage from "./pages/bty/VeteransOutreachWisconsinPage";
import Vets2IndustryPage from "./pages/bty/Vets2IndustryPage";
import MilitaryMissionsInActionPage from "./pages/bty/MilitaryMissionsInActionPage";
import VeteransBreakfastClubPage from "./pages/bty/VeteransBreakfastClubPage";
import AmericanCorporatePartnersPage from "./pages/bty/AmericanCorporatePartnersPage";
import AuthorityResources from "./pages/authority/Resources";
import AuthorityFamilySystems from "./pages/authority/FamilySystems";
import AuthorityMilitaryFamilyTherapy from "./pages/authority/MilitaryFamilyTherapy";
import AuthorityVeteranMentalHealthCare from "./pages/authority/VeteranMentalHealthCare";
import AuthorityVACommunityCareMentalHealth from "./pages/authority/VACommunityCareMentalHealth";
import AuthorityResourcesChampva from "./pages/authority/ResourcesChampva";
import AuthorityResourcesDocumentation from "./pages/authority/ResourcesDocumentation";
import AuthorityResourcesFamilySystems from "./pages/authority/ResourcesFamilySystems";
import AuthorityResourcesVACommunityCare from "./pages/authority/ResourcesVACommunityCare";
import AuthorityResourcesVeteranMentalHealth from "./pages/authority/ResourcesVeteranMentalHealth";

const queryClient = new QueryClient();

function LegacyBtyRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={{
        pathname: "/beyond-the-yellow",
        search: location.search,
        hash: location.hash,
      }}
      replace
    />
  );
}

// Legacy path aliases → current approved destinations.
const legacyRedirects: { from: string; to: string }[] = [
  { from: "/therapy", to: "/get-care" },
  { from: "/get-started", to: "/get-care" },
  { from: "/how-it-works", to: "/get-care" },
  { from: "/partners", to: "/partner" },
  { from: "/support", to: "/impact" },
  { from: "/donate", to: "/impact" },
  { from: "/fund-access-to-care", to: "/impact" },
  { from: "/sponsors", to: "/impact" },
  { from: "/sponsor-care", to: "/impact" },
  { from: "/monthly-supporters", to: "/impact" },
  { from: "/funders", to: "/impact" },
  { from: "/referral-partners", to: "/partner" },
  { from: "/mission-one-pager", to: "/partner" },
  { from: "/faq", to: "/contact" },
  { from: "/urgent-help", to: "/get-care" },
  { from: "/influencer", to: "/beyond-the-yellow" },
  { from: "/authority/resources", to: "/resources" },
  { from: "/authority/resources/champva", to: "/resources/champva" },
  {
    from: "/authority/resources/documentation",
    to: "/resources/documentation",
  },
  {
    from: "/authority/resources/family-systems",
    to: "/resources/family-systems",
  },
  {
    from: "/authority/resources/va-community-care",
    to: "/resources/va-community-care",
  },
  {
    from: "/authority/resources/veteran-mental-health",
    to: "/resources/veteran-mental-health",
  },
  {
    from: "/authority/veteran-mental-health-care",
    to: "/veteran-mental-health-care",
  },
  {
    from: "/authority/va-community-care-mental-health",
    to: "/va-community-care-mental-health",
  },
  {
    from: "/authority/military-family-therapy",
    to: "/military-family-therapy",
  },
  { from: "/authority/family-systems", to: "/family-systems" },
];

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/videos" element={<Navigate to="/watch" replace />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/beyondtheyellow" element={<LegacyBtyRedirect />} />
            <Route path="/beyond-the-yellow" element={<BtyBillingHubPage />} />
            <Route path="/gallantfew" element={<GallantFewPage />} />
            <Route path="/VOW" element={<VeteransOutreachWisconsinPage />} />
            <Route path="/vets2industry" element={<Vets2IndustryPage />} />
            <Route path="/mmia" element={<MilitaryMissionsInActionPage />} />
            <Route path="/veteransbreakfastclub" element={<VeteransBreakfastClubPage />} />
            <Route
              path="/americancorporatepartners"
              element={
                <div className="acp-page">
                  <AmericanCorporatePartnersPage />
                </div>
              }
            />
            <Route path="/clinicians" element={<Clinicians />} />
            <Route
              path="/therapists"
              element={<Navigate to="/clinicians" replace />}
            />
            <Route path="/get-care" element={<GetCareWithSignup />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/pendulo" element={<Pendulo />} />

            <Route path="/resources" element={<AuthorityResources />} />
            <Route path="/resources/champva" element={<AuthorityResourcesChampva />} />
            <Route
              path="/resources/documentation"
              element={<AuthorityResourcesDocumentation />}
            />
            <Route
              path="/resources/family-systems"
              element={<AuthorityResourcesFamilySystems />}
            />
            <Route
              path="/resources/va-community-care"
              element={<AuthorityResourcesVACommunityCare />}
            />
            <Route
              path="/resources/veteran-mental-health"
              element={<AuthorityResourcesVeteranMentalHealth />}
            />

            <Route path="/family-systems" element={<AuthorityFamilySystems />} />
            <Route
              path="/military-family-therapy"
              element={<AuthorityMilitaryFamilyTherapy />}
            />
            <Route
              path="/veteran-mental-health-care"
              element={<AuthorityVeteranMentalHealthCare />}
            />
            <Route
              path="/va-community-care-mental-health"
              element={<AuthorityVACommunityCareMentalHealth />}
            />

            {legacyRedirects.map((redirect) => (
              <Route
                key={redirect.from}
                path={redirect.from}
                element={<Navigate to={redirect.to} replace />}
              />
            ))}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
