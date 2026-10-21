import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CLINICIAN_INTEREST_ADS_CONVERSION,
  CLINICIAN_INTEREST_EVENT_NAME,
  clearTrackedClinicianAdsConversionsForTests,
  CLINICIAN_INTEREST_FORM_ID,
  CLINICIAN_INTEREST_FORM_NAME,
  trackClinicianInterestRegistered,
} from "./clinicianConversionTracking";
import {
  PUBLIC_FORMS,
  clearTrackedFormSubmissionsForTests,
} from "./sitewideFormTracking";

describe("trackClinicianInterestRegistered", () => {
  afterEach(() => {
    delete window.gtag;
    clearTrackedFormSubmissionsForTests();
    clearTrackedClinicianAdsConversionsForTests();
    vi.restoreAllMocks();
  });

  it("fires the supplied Ads action at the confirmed success boundary", () => {
    expect(CLINICIAN_INTEREST_FORM_ID).toBe(
      PUBLIC_FORMS.clinicianInterest.id,
    );
    expect(CLINICIAN_INTEREST_FORM_NAME).toBe(
      PUBLIC_FORMS.clinicianInterest.name,
    );
    expect(CLINICIAN_INTEREST_EVENT_NAME).toBe(
      PUBLIC_FORMS.clinicianInterest.eventName,
    );

    const gtag = vi.fn();
    window.gtag = gtag;

    expect(
      trackClinicianInterestRegistered("clinician-interest-123"),
    ).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(3);
    expect(gtag).toHaveBeenNthCalledWith(
      1,
      "event",
      "vw_form_success",
      expect.objectContaining({
        event_id: "clinician-interest-123",
        form_id: CLINICIAN_INTEREST_FORM_ID,
        form_name: CLINICIAN_INTEREST_FORM_NAME,
      }),
    );
    expect(gtag).toHaveBeenNthCalledWith(
      2,
      "event",
      CLINICIAN_INTEREST_EVENT_NAME,
      expect.any(Object),
    );
    expect(gtag).toHaveBeenNthCalledWith(
      3,
      "event",
      "conversion",
      expect.objectContaining({
        send_to: CLINICIAN_INTEREST_ADS_CONVERSION,
        value: 1.0,
        currency: "USD",
        transaction_id: "clinician-interest-123",
      }),
    );
  });

  it("does not double-count a submission ID", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackClinicianInterestRegistered("clinician-interest-duplicate");
    trackClinicianInterestRegistered("clinician-interest-duplicate");

    expect(gtag).toHaveBeenCalledTimes(3);
    expect(gtag.mock.calls.filter((call) => call[1] === "conversion")).toHaveLength(1);
  });

  it("fails closed when gtag is unavailable", () => {
    expect(
      trackClinicianInterestRegistered("clinician-interest-123"),
    ).toBe(false);
  });
});
