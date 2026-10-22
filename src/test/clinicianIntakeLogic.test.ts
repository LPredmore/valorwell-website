import { describe, expect, it } from "vitest";
import {
  isConfirmedPersistence,
  isDatabaseUnavailable,
  isUniqueViolation,
  matchesSubmission,
  outageAlertKey,
} from "../../supabase/functions/register-clinician-interest/logic";

const applicant = { firstName: "Jordan", lastName: "Taylor", email: "j@example.com" };
const row = (payload: object, type = "clinician_application") => ({ id: "1", submission_type: type, payload });

describe("clinician intake logic", () => {
  it("treats PGRST002 schema-cache errors and timeouts as database unavailable", () => {
    expect(isDatabaseUnavailable({ code: "PGRST002", message: "" })).toBe(true);
    expect(isDatabaseUnavailable({ code: "", message: "Connection terminated due to connection timeout" })).toBe(true);
    expect(isDatabaseUnavailable({ code: "23502", message: "null value in column" })).toBe(false);
  });
  it("recognizes unique violations", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation({ code: "23502" })).toBe(false);
  });
  it("verifies a duplicate only when the stored applicant matches", () => {
    expect(matchesSubmission(row({ first_name: "jordan", last_name: "TAYLOR", email: "J@example.com" }), applicant)).toBe(true);
    expect(matchesSubmission(row({ first_name: "Sam", last_name: "Taylor", email: "j@example.com" }), applicant)).toBe(false);
    expect(matchesSubmission(row({ first_name: "Jordan", last_name: "Taylor", email: "j@example.com" }, "client_signup"), applicant)).toBe(false);
    expect(matchesSubmission(null, applicant)).toBe(false);
  });
  it("counts only persisted or verified duplicates as confirmed", () => {
    expect(isConfirmedPersistence("persisted")).toBe(true);
    expect(isConfirmedPersistence("verified_duplicate")).toBe(true);
    expect(isConfirmedPersistence("indeterminate")).toBe(false);
    expect(isConfirmedPersistence("key_conflict")).toBe(false);
  });
  it("collapses outage alerts to one per UTC hour", () => {
    expect(outageAlertKey(new Date("2026-10-22T15:10:00Z"))).toBe(outageAlertKey(new Date("2026-10-22T15:59:59Z")));
    expect(outageAlertKey(new Date("2026-10-22T15:59:59Z"))).not.toBe(outageAlertKey(new Date("2026-10-22T16:00:00Z")));
  });
});
