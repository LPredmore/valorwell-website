import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { canonicalRoutes, redirects } from "../../site-route-contract.mjs";

vi.mock("../integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
    },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }) }),
    }),
    functions: { invoke: async () => ({ data: null, error: null }) },
    storage: { from: () => ({ list: async () => ({ data: [], error: null }) }) },
  },
}));

// The destination page pulls in SEO metadata and live data that this routing
// test does not exercise, so it stands in for a plain marker.
vi.mock("../pages/Clinicians", () => ({
  default: () => <p>clinicians page</p>,
}));

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

afterEach(cleanup);

describe("careers route", () => {
  it("redirects /careers to /clinicians", () => {
    expect(redirects.find((redirect) => redirect.from === "/careers")?.to).toBe(
      "/clinicians",
    );
  });

  it("keeps /careers out of canonical routes so it is never prerendered or sitemapped", () => {
    expect(canonicalRoutes.find((route) => route.path === "/careers")).toBeUndefined();
  });

  it("sends a visitor who opens /careers to /clinicians", async () => {
    const { AppRoutes } = await import("../AppRoutes");

    const { findByTestId } = render(
      <MemoryRouter initialEntries={["/careers"]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect((await findByTestId("location")).textContent).toBe("/clinicians");
  });

  it("carries a query string through the careers redirect", async () => {
    const { AppRoutes } = await import("../AppRoutes");

    const { findByTestId } = render(
      <MemoryRouter initialEntries={["/careers?utm_source=newsletter"]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect((await findByTestId("location")).textContent).toBe(
      "/clinicians?utm_source=newsletter",
    );
  });
});
