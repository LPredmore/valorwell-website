import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { canonicalRoutes, redirects } from "../site-route-contract.mjs";

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

function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();

  return (
    <Navigate
      to={{
        pathname: to,
        search: location.search,
        hash: location.hash,
      }}
      replace
    />
  );
}

const routeElements: Record<string, ReactNode> = {
  "/": <HomePage />,
  "/mission": <MissionPage />,
  "/about": <AboutPage />,
  "/impact": <ImpactPage />,
  "/donate": <DonatePage />,
  "/beyond-the-yellow": <BtyBillingHubPage />,
  "/watch": <WatchPage />,
  "/network": <NetworkPage />,
  "/get-care": <GetCareWithSignup />,
  "/clinicians": <Clinicians />,
  "/veteran-mental-health-care": <AuthorityVeteranMentalHealthCare />,
  "/va-community-care-mental-health": <AuthorityVACommunityCareMentalHealth />,
  "/military-family-therapy": <AuthorityMilitaryFamilyTherapy />,
  "/family-systems": <AuthorityFamilySystems />,
  "/resources": <AuthorityResources />,
  "/resources/champva": <AuthorityResourcesChampva />,
  "/resources/va-community-care": <AuthorityResourcesVACommunityCare />,
  "/resources/documentation": <AuthorityResourcesDocumentation />,
  "/resources/veteran-mental-health": <AuthorityResourcesVeteranMentalHealth />,
  "/resources/family-systems": <AuthorityResourcesFamilySystems />,
  "/partner": <Partner />,
  "/contact": <Contact />,
  "/gallantfew": <GallantFewPage />,
  "/VOW": <VeteransOutreachWisconsinPage />,
  "/vets2industry": <Vets2IndustryPage />,
  "/mmia": <MilitaryMissionsInActionPage />,
  "/veteransbreakfastclub": <VeteransBreakfastClubPage />,
  "/privacy": <Privacy />,
  "/americancorporatepartners": (
    <div className="acp-page">
      <AmericanCorporatePartnersPage />
    </div>
  ),
  "/pendulo": <Pendulo />,
};

export function AppRoutes() {
  return (
    <Routes>
      {canonicalRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={routeElements[route.path]}
        />
      ))}

      {redirects.map((redirect) => (
        <Route
          key={redirect.from}
          path={redirect.from}
          element={<LegacyRedirect to={redirect.to} />}
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
