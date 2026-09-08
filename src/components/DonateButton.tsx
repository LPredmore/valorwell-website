import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackDonationCheckoutStart } from "@/lib/tracking";

export const ZEFFY_DONATION_FORM_URL =
  "https://www.zeffy.com/embed/donation-form/the-valorwell-bridge-fund?modal=true";

const ZEFFY_EMBED_SCRIPT_URL = "https://www.zeffy.com/embed/v2/zeffy-embed.js";
const ZEFFY_EMBED_SCRIPT_ID = "zeffy-embed-script";

type Variant = "solid" | "outline" | "link";
type Size = "sm" | "md" | "lg";

interface DonateButtonProps {
  /** Stable identifier for the CTA placement. */
  source: string;
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  className?: string;
  withIcon?: boolean;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

/**
 * Single source of truth for donation CTAs.
 *
 * Every donation CTA opens the ValorWell Bridge Fund in Zeffy's modal. The
 * direct Zeffy URL remains on the anchor as a fallback if the embed script is
 * unavailable, while click metadata stays internal to ValorWell analytics.
 */
export function DonateButton({
  source,
  variant = "solid",
  size = "md",
  children = "Donate",
  className,
  withIcon = false,
  utmMedium = "site",
  utmCampaign = "the-valorwell-bridge-fund",
  utmContent,
}: DonateButtonProps) {
  const [handoffId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (
      document.getElementById(ZEFFY_EMBED_SCRIPT_ID) ||
      document.querySelector(`script[src="${ZEFFY_EMBED_SCRIPT_URL}"]`)
    ) {
      return;
    }

    const script = document.createElement("script");
    script.id = ZEFFY_EMBED_SCRIPT_ID;
    script.src = ZEFFY_EMBED_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    trackDonationCheckoutStart(handoffId, {
      source,
      medium: utmMedium,
      campaign: utmCampaign,
      content: utmContent,
    });
  };

  const sizeCls =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : size === "lg"
        ? "px-6 py-3.5 text-base"
        : "px-4 py-2 text-sm";

  const base =
    "inline-flex items-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap";

  const variantCls =
    variant === "outline"
      ? "border border-primary/40 text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"
      : variant === "link"
        ? "text-primary hover:text-foreground underline-offset-4 hover:underline p-0"
        : "bg-accent text-accent-foreground shadow-sm hover:brightness-95";

  return (
    <a
      href={ZEFFY_DONATION_FORM_URL}
      {...{ "zeffy-form-link": ZEFFY_DONATION_FORM_URL }}
      data-donate-source={source}
      data-donate-medium={utmMedium}
      data-donate-campaign={utmCampaign}
      data-donate-content={utmContent}
      aria-haspopup="dialog"
      className={cn(base, variant !== "link" && sizeCls, variantCls, className)}
      onClick={handleClick}
    >
      {withIcon && <Heart className="h-4 w-4" aria-hidden />}
      {children}
    </a>
  );
}
