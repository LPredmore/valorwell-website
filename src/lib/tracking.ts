import {
  createFormSubmissionEventId,
  trackSuccessfulFormSubmission,
  type PublicFormKey,
} from "./sitewideFormTracking";

const DONATION_CHECKOUT_CONVERSION = "AW-16798905432/2XDvCITusvcbENjoq8o-";
const FALLBACK_FORM_DEDUPE_WINDOW_MS = 30_000;

const SUCCESSFUL_PUBLIC_FORM_EVENTS: Partial<Record<string, PublicFormKey>> = {
  bty_guest_application_submit: "btyGuest",
  bty_nomination_submit: "btyNomination",
  ocs_form_submit: "ocsRouting",
};

const recentFallbackSubmissionIds = new Map<
  PublicFormKey,
  { id: string; expiresAt: number }
>();

interface DonationCheckoutMetadata {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

function resolvePublicFormSubmissionId(
  formKey: PublicFormKey,
  suppliedSubmissionId?: string,
): string {
  const normalizedSuppliedId = suppliedSubmissionId?.trim();
  if (normalizedSuppliedId) return normalizedSuppliedId;

  const now = Date.now();
  const recent = recentFallbackSubmissionIds.get(formKey);
  if (recent && recent.expiresAt > now) return recent.id;

  const id = createFormSubmissionEventId(formKey);
  recentFallbackSubmissionIds.set(formKey, {
    id,
    expiresAt: now + FALLBACK_FORM_DEDUPE_WINDOW_MS,
  });
  return id;
}

/**
 * Records donation-checkout intent without navigating away from the current
 * page. This is used by the Zeffy modal so analytics never blocks the modal.
 */
export function trackDonationCheckoutStart(
  handoffId: string,
  metadata: DonationCheckoutMetadata,
) {
  if (typeof window === "undefined") return;

  const dedupeKey = `valorwell_donation_checkout:${handoffId}`;
  try {
    if (window.sessionStorage.getItem(dedupeKey)) return;
    window.sessionStorage.setItem(dedupeKey, new Date().toISOString());
  } catch {
    // Conversion deduplication is best effort when browser storage is blocked.
  }

  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") return;

  try {
    gtagFn("event", "begin_donation", {
      event_id: handoffId,
      cta_source: metadata.source,
      cta_medium: metadata.medium,
      cta_campaign: metadata.campaign,
      cta_content: metadata.content,
      transport_type: "beacon",
    });

    gtagFn("event", "conversion", {
      send_to: DONATION_CHECKOUT_CONVERSION,
      value: 1,
      currency: "USD",
      transaction_id: handoffId,
      transport_type: "beacon",
    });
  } catch {
    // Analytics is best effort and must never block the donation modal.
  }
}

/**
 * Records donation-checkout intent before a legacy route redirects. New Zeffy
 * modal buttons use trackDonationCheckoutStart so they stay on the current page.
 */
export function trackDonationCheckoutStartAndRedirect(
  destinationUrl: string,
  handoffId: string,
  metadata: DonationCheckoutMetadata,
) {
  if (typeof window === "undefined") return;

  const redirect = () => window.location.assign(destinationUrl);
  const dedupeKey = `valorwell_donation_checkout:${handoffId}`;
  try {
    if (window.sessionStorage.getItem(dedupeKey)) {
      redirect();
      return;
    }
    window.sessionStorage.setItem(dedupeKey, new Date().toISOString());
  } catch {
    // Conversion deduplication is best effort when browser storage is blocked.
  }

  let didRedirect = false;
  const redirectOnce = () => {
    if (didRedirect) return;
    didRedirect = true;
    redirect();
  };
  const timeout = window.setTimeout(redirectOnce, 2500);

  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") {
    window.clearTimeout(timeout);
    redirectOnce();
    return;
  }

  try {
    gtagFn("event", "begin_donation", {
      event_id: handoffId,
      cta_source: metadata.source,
      cta_medium: metadata.medium,
      cta_campaign: metadata.campaign,
      cta_content: metadata.content,
      transport_type: "beacon",
    });

    gtagFn("event", "conversion", {
      send_to: DONATION_CHECKOUT_CONVERSION,
      value: 1,
      currency: "USD",
      transaction_id: handoffId,
      transport_type: "beacon",
      event_timeout: 2000,
      event_callback: () => {
        window.clearTimeout(timeout);
        redirectOnce();
      },
    });
  } catch {
    window.clearTimeout(timeout);
    redirectOnce();
  }
}

/**
 * @deprecated Public form conversions are now emitted by trackHomeEvent through
 * the centralized sitewide form tracker. Kept temporarily so older callers do
 * not create a second conversion while the form components are consolidated.
 */
export function trackCreatorApplicationConversion(): false {
  return false;
}

/**
 * Fires the Google Ads conversion event for VibeTales outbound clicks,
 * then opens the destination URL in a new tab.
 * Uses event_callback so the new tab opens only after the beacon is sent.
 * Hard 2-second timeout ensures users are never stranded.
 */
export function trackVibeTalesOutboundClick(url: string) {
  let didOpen = false;

  const openUrl = () => {
    if (didOpen) return;
    didOpen = true;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (typeof window === "undefined") return;

  const timeout = window.setTimeout(openUrl, 2000);

  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") {
    window.clearTimeout(timeout);
    openUrl();
    return;
  }

  gtagFn("event", "conversion", {
    send_to: "AW-16798905432/YutLCKDmnqAcENjoq8o-",
    value: 1.0,
    currency: "USD",
    event_callback: () => {
      window.clearTimeout(timeout);
      openUrl();
    },
  });
}

/**
 * Generic outbound-click tracker for app landing pages (Ninja-Do, SkillsQuest, etc.).
 * Reuses the same Google Ads conversion as VibeTales until per-app labels are provided.
 */
export function trackAppOutboundClick(url: string) {
  trackVibeTalesOutboundClick(url);
}

/**
 * Sends a page_view beacon to Google Ads, then redirects.
 * Uses event_callback so the redirect only fires after the beacon is sent.
 * Hard 2-second timeout ensures users are never stranded.
 */
export function trackPageAndRedirect(destinationUrl: string) {
  let didRedirect = false;

  const redirect = () => {
    if (didRedirect) return;
    didRedirect = true;
    window.location.replace(destinationUrl);
  };

  const timeout = window.setTimeout(redirect, 2000);

  if (typeof window === "undefined") {
    redirect();
    return;
  }

  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") {
    redirect();
    return;
  }

  gtagFn("event", "page_view", {
    send_to: "AW-11339741081",
    transport_type: "beacon",
    event_callback: () => {
      window.clearTimeout(timeout);
      redirect();
    },
  });
}

/**
 * Generic website event tracker. Successful public-form events are mirrored
 * into the shared form_submit pipeline so Google can discover every registered
 * form without a per-conversion event snippet. Callers should provide their
 * backend submission ID when available; the bounded fallback protects older
 * callers from immediate duplicate success invocations.
 */
export function trackHomeEvent(
  name: string,
  params: Record<string, unknown> = {},
  submissionId?: string,
) {
  if (typeof window === "undefined") return;
  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") return;

  try {
    gtagFn("event", name, { event_category: "homepage", ...params });

    const publicFormKey = SUCCESSFUL_PUBLIC_FORM_EVENTS[name];
    if (publicFormKey) {
      trackSuccessfulFormSubmission(
        publicFormKey,
        resolvePublicFormSubmissionId(publicFormKey, submissionId),
      );
    }
  } catch {
    /* no-op */
  }
}

export function clearRecentFormSubmissionIdsForTests(): void {
  recentFallbackSubmissionIds.clear();
}