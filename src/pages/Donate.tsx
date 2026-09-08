import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { DonateButton } from "@/components/DonateButton";

export default function Donate() {
  useEffect(() => {
    const gtagFn = typeof window !== "undefined" ? window.gtag : undefined;
    if (typeof gtagFn !== "function") return;

    try {
      gtagFn("event", "page_view", {
        page_path: "/donate",
        page_title: "Donate",
        transport_type: "beacon",
      });
    } catch {
      // Analytics is best effort and must never block the donation experience.
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Donate | ValorWell</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
        <div className="max-w-lg text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/70">
            ValorWell Foundation
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Support the ValorWell Bridge Fund
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Your donation helps pay therapists to provide mental-health care to veterans who have sought help but still do not have an available path into treatment.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            ValorWell and the ValorWell Foundation fund administrative and operating costs separately from donated funds.
          </p>

          <div className="mt-7 flex justify-center">
            <DonateButton
              source="donate-page"
              size="lg"
              withIcon
              utmCampaign="the-valorwell-bridge-fund"
              utmContent="primary"
            >
              Donate with Zeffy
            </DonateButton>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            The secure donation form is provided by Zeffy and opens over this page.
          </p>
        </div>
      </div>
    </>
  );
}
