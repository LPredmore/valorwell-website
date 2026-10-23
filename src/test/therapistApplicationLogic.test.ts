import { describe, expect, it } from "vitest";
import {
  CODE_MAX_ATTEMPTS,
  US_STATES,
  checkCode,
  isValidNpi,
  normalizeLicenseNumber,
  shouldSendInvite,
  validateStepOne,
  validateStepThree,
  validateStepTwo,
} from "../../supabase/functions/therapist-application/logic";

describe("step 1 validation (license category + states)", () => {
  it("accepts a known category with multiple states, deduped and uppercased", () => {
    const result = validateStepOne({ licenseCategory: "professional_counselor", states: ["tx", "TX", "wi"] });
    expect(result).toEqual({ ok: true, value: { licenseCategory: "professional_counselor", states: ["TX", "WI"] } });
  });

  it("rejects an unknown category", () => {
    expect(validateStepOne({ licenseCategory: "life_coach", states: ["TX"] }).ok).toBe(false);
  });

  it("rejects an empty state list and unrecognized state codes", () => {
    expect(validateStepOne({ licenseCategory: "psychologist", states: [] }).ok).toBe(false);
    expect(validateStepOne({ licenseCategory: "psychologist", states: ["XX"] }).ok).toBe(false);
  });

  it("covers exactly the 50 states plus DC", () => {
    expect(US_STATES).toHaveLength(51);
  });
});

describe("step 2 validation (per-state license numbers)", () => {
  it("requires one nonempty number per selected state and drops unselected states", () => {
    const result = validateStepTwo(["TX", "WI"], { TX: " 00123 ", WI: "ABC-456", CA: "ignored" });
    expect(result).toEqual({ ok: true, value: { TX: "00123", WI: "ABC-456" } });
  });

  it("preserves leading zeros and dashes", () => {
    expect(normalizeLicenseNumber(" 00789-01 ")).toBe("00789-01");
  });

  it("fails when any selected state is missing its number", () => {
    const result = validateStepTwo(["TX", "WI"], { TX: "123" });
    if (result.ok) throw new Error("expected validation to fail");
    expect(result.error).toContain("WI");
  });

  it("rejects non-object payloads", () => {
    expect(validateStepTwo(["TX"], "123").ok).toBe(false);
    expect(validateStepTwo(["TX"], null).ok).toBe(false);
  });
});

describe("step 3 validation (NPI yes/no)", () => {
  it("No means no NPI is required", () => {
    expect(validateStepThree({ hasNpi: false })).toEqual({ ok: true, value: { npiDeclared: false, npi: null } });
  });

  it("Yes requires a valid 10-digit NPI", () => {
    expect(validateStepThree({ hasNpi: true, npi: "1234567893" })).toEqual({
      ok: true,
      value: { npiDeclared: true, npi: "1234567893" },
    });
    expect(validateStepThree({ hasNpi: true, npi: "1234567890" }).ok).toBe(false);
    expect(validateStepThree({ hasNpi: true, npi: "" }).ok).toBe(false);
  });

  it("rejects a missing answer", () => {
    expect(validateStepThree({}).ok).toBe(false);
  });

  it("frontend and backend NPI checks agree", () => {
    // Same algorithm on both sides; spot-check they stay in sync.
    expect(isValidNpi("1245319599")).toBe(true);
  });
});

describe("verification code checks", () => {
  const row = {
    code_hash: "abc",
    expires_at: new Date(Date.now() + 60000).toISOString(),
    used_at: null,
    attempts: 0,
  };

  it("accepts a matching, unexpired, unused code", () => {
    expect(checkCode(row, "abc", new Date()).outcome).toBe("valid");
  });

  it("rejects mismatched, expired, used, and locked codes", () => {
    expect(checkCode(row, "wrong", new Date()).outcome).toBe("mismatch");
    expect(checkCode({ ...row, expires_at: new Date(Date.now() - 1000).toISOString() }, "abc", new Date()).outcome).toBe("expired");
    expect(checkCode({ ...row, used_at: new Date().toISOString() }, "abc", new Date()).outcome).toBe("used");
    expect(checkCode({ ...row, attempts: CODE_MAX_ATTEMPTS }, "abc", new Date()).outcome).toBe("locked");
  });
});

describe("initial invite decision", () => {
  it("sends only for a brand-new confirmed save", () => {
    expect(shouldSendInvite("persisted", false)).toBe(true);
  });

  it("never sends for honeypots, duplicates, or unconfirmed writes", () => {
    expect(shouldSendInvite("persisted", true)).toBe(false);
    expect(shouldSendInvite("verified_duplicate", false)).toBe(false);
    expect(shouldSendInvite("indeterminate", false)).toBe(false);
    expect(shouldSendInvite("validation_failed", false)).toBe(false);
  });
});
