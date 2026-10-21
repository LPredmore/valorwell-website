import {
  PUBLIC_FORMS,
  trackSuccessfulFormSubmission,
} from "./sitewideFormTracking";

export const CLINICIAN_INTEREST_FORM_ID = PUBLIC_FORMS.clinicianInterest.id;
export const CLINICIAN_INTEREST_FORM_NAME = PUBLIC_FORMS.clinicianInterest.name;
export const CLINICIAN_INTEREST_EVENT_NAME =
  PUBLIC_FORMS.clinicianInterest.eventName;

/** The Google Ads "Therapist Application Submitted" action supplied for ValorWell. */
export const CLINICIAN_INTEREST_ADS_CONVERSION =
  "AW-16798905432/XWcdCMz27tscENjoq8o-";

const trackedAdsConversions = new Set<string>();

/**
 * Tracks a successful first-step clinician-interest registration, not a
 * completed credentialing application. Only call after the backend returns
 * ok: true, and never for honeypot submissions.
 */
export function trackClinicianInterestRegistered(
  submissionId: string,
): boolean {
  const tracked = trackSuccessfulFormSubmission("clinicianInterest", submissionId);
  if (typeof window === "undefined") return tracked;

  const normalizedId = submissionId.trim();
  if (!normalizedId || trackedAdsConversions.has(normalizedId)) return tracked;

  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") return tracked;

  try {
    gtagFn("event", "conversion", {
      send_to: CLINICIAN_INTEREST_ADS_CONVERSION,
      value: 1.0,
      currency: "USD",
      transaction_id: normalizedId,
      transport_type: "beacon",
    });
    trackedAdsConversions.add(normalizedId);
  } catch {
    // Ads reporting must never interrupt the successful form confirmation.
  }

  return tracked;
}

export function clearTrackedClinicianAdsConversionsForTests(): void {
  trackedAdsConversions.clear();
}
