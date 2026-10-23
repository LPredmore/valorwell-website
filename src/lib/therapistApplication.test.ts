import { describe, expect, it } from "vitest";
import {
  LICENSE_CATEGORIES,
  US_STATES,
  isValidEmail,
  isValidNpi,
  normalizeEmail,
} from "./therapistApplication";

describe("therapist application constants", () => {
  it("lists all 50 states plus DC", () => {
    expect(US_STATES).toHaveLength(51);
    expect(US_STATES.some((s) => s.code === "DC")).toBe(true);
    expect(new Set(US_STATES.map((s) => s.code)).size).toBe(51);
  });

  it("offers the licensed mental health practice categories with common equivalents", () => {
    const values = LICENSE_CATEGORIES.map((c) => c.value);
    expect(values).toEqual([
      "clinical_social_worker",
      "professional_counselor",
      "mental_health_counselor",
      "marriage_family_therapist",
      "psychologist",
      "other_independent",
    ]);
    expect(LICENSE_CATEGORIES.find((c) => c.value === "clinical_social_worker")?.equivalents).toContain("LCSW");
    expect(LICENSE_CATEGORIES.find((c) => c.value === "professional_counselor")?.equivalents).toContain("LPC");
  });
});

describe("email normalization", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Jane.Doe@Example.COM ")).toBe("jane.doe@example.com");
  });

  it("validates shape", () => {
    expect(isValidEmail("jane@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("NPI check-digit validation", () => {
  it("accepts NPIs with a valid Luhn check digit", () => {
    // Well-known valid NPI examples (check digit computed with the 80840 prefix).
    expect(isValidNpi("1234567893")).toBe(true);
    expect(isValidNpi("1245319599")).toBe(true);
  });

  it("rejects bad check digits, wrong length, and non-digits", () => {
    expect(isValidNpi("1234567890")).toBe(false);
    expect(isValidNpi("123456789")).toBe(false);
    expect(isValidNpi("12345678934")).toBe(false);
    expect(isValidNpi("12345678ab")).toBe(false);
    expect(isValidNpi("")).toBe(false);
  });
});
