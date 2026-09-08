import { useState } from "react";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { trackDonationCheckoutStart } from "@/lib/tracking";

export const ZEFFY_DONATION_FORM_URL =
  "https://www.zeffy.com/embed/donation-form/the-valorwell-bridge-fund?modal=true";

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
 * Donation CTAs open the ValorWell Bridge Fund in a controlled on-site modal.
 * The Zeffy campaign stays inside an iframe so clicking a CTA never navigates
 * the visitor away from the current ValorWell route.
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
  const [open, setOpen] = useState(false);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          data-donate-source={source}
          data-donate-medium={utmMedium}
          data-donate-campaign={utmCampaign}
          data-donate-content={utmContent}
          className={cn(base, variant !== "link" && sizeCls, variantCls, className)}
          onClick={handleClick}
        >
          {withIcon && <Heart className="h-4 w-4" aria-hidden />}
          {children}
        </button>
      </DialogTrigger>

      <DialogContent className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-3xl flex-col gap-0 overflow-hidden border-0 bg-white p-0 sm:h-[min(90dvh,900px)]">
        <div className="shrink-0 border-b border-border bg-background px-5 py-4 pr-14">
          <DialogTitle>Donate to the ValorWell Bridge Fund</DialogTitle>
          <DialogDescription className="mt-1">
            Complete your donation securely through Zeffy without leaving ValorWell.
          </DialogDescription>
        </div>
        <iframe
          title="ValorWell Bridge Fund donation form"
          src={ZEFFY_DONATION_FORM_URL}
          className="min-h-0 flex-1 border-0 bg-white"
          allow="payment *"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </DialogContent>
    </Dialog>
  );
}
