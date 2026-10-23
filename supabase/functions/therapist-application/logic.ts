// Pure, dependency-free logic for the therapist qualification flow.
// Imported by the edge function and by the website test suite; keep it free of
// Deno APIs, environment variables, and network calls.

export const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export const US_STATES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const STATE_CODES: ReadonlySet<string> = new Set(US_STATES.map((s) => s.code));

export const LICENSE_CATEGORIES: ReadonlyArray<{ value: string; label: string; equivalents: string }> = [
  { value: "clinical_social_worker", label: "Clinical Social Worker", equivalents: "LCSW, LICSW, LISW" },
  { value: "professional_counselor", label: "Professional Counselor", equivalents: "LPC, LCPC, LPCC" },
  { value: "mental_health_counselor", label: "Mental Health Counselor", equivalents: "LMHC" },
  { value: "marriage_family_therapist", label: "Marriage and Family Therapist", equivalents: "LMFT" },
  { value: "psychologist", label: "Psychologist", equivalents: "Licensed Psychologist (PhD or PsyD)" },
  { value: "other_independent", label: "Other independently licensed mental health therapist", equivalents: "" },
];

export const LICENSE_CATEGORY_VALUES: ReadonlySet<string> = new Set(LICENSE_CATEGORIES.map((c) => c.value));

export const MAX_STATES = US_STATES.length;
export const MAX_LICENSE_NUMBER_LENGTH = 64;
export const CODE_LENGTH = 6;
export const CODE_TTL_MINUTES = 15;
export const CODE_MAX_ATTEMPTS = 5;
export const CODES_PER_EMAIL_PER_HOUR = 3;
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Preserves leading zeros and dashes; only trims and caps length. */
export function normalizeLicenseNumber(value: unknown): string {
  return String(value ?? "").trim().slice(0, MAX_LICENSE_NUMBER_LENGTH);
}

/** NPI check-digit validation: Luhn over "80840" + first nine digits. */
export function isValidNpi(npi: string): boolean {
  if (!/^\d{10}$/.test(npi)) return false;
  const digits = ("80840" + npi.slice(0, 9)).split("").map(Number);
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if ((digits.length - i) % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10 === Number(npi[9]);
}

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateStepOne(input: { licenseCategory?: unknown; states?: unknown }): Validation<{ licenseCategory: string; states: string[] }> {
  const licenseCategory = String(input.licenseCategory ?? "").trim();
  if (!LICENSE_CATEGORY_VALUES.has(licenseCategory)) {
    return { ok: false, error: "Choose the license category that fits you best." };
  }
  if (!Array.isArray(input.states)) {
    return { ok: false, error: "Select at least one state where you are licensed." };
  }
  const states = [...new Set(input.states.map((s) => String(s ?? "").trim().toUpperCase()))];
  if (states.length === 0) return { ok: false, error: "Select at least one state where you are licensed." };
  if (states.length > MAX_STATES) return { ok: false, error: "Too many states selected." };
  if (states.some((code) => !STATE_CODES.has(code))) {
    return { ok: false, error: "One of the selected states is not recognized." };
  }
  return { ok: true, value: { licenseCategory, states } };
}

export function validateStepTwo(
  states: string[],
  licenseNumbers: unknown,
): Validation<Record<string, string>> {
  if (licenseNumbers === null || typeof licenseNumbers !== "object" || Array.isArray(licenseNumbers)) {
    return { ok: false, error: "Enter a license number for each selected state." };
  }
  const raw = licenseNumbers as Record<string, unknown>;
  const cleaned: Record<string, string> = {};
  for (const state of states) {
    const value = normalizeLicenseNumber(raw[state]);
    if (!value) return { ok: false, error: `Enter your license number for ${state}.` };
    cleaned[state] = value;
  }
  return { ok: true, value: cleaned };
}

export function validateStepThree(input: { hasNpi?: unknown; npi?: unknown }): Validation<{ npiDeclared: boolean; npi: string | null }> {
  if (typeof input.hasNpi !== "boolean") {
    return { ok: false, error: "Tell us whether you have an NPI number." };
  }
  if (!input.hasNpi) return { ok: true, value: { npiDeclared: false, npi: null } };
  const npi = String(input.npi ?? "").trim();
  if (!isValidNpi(npi)) {
    return { ok: false, error: "Enter a valid 10-digit NPI number." };
  }
  return { ok: true, value: { npiDeclared: true, npi } };
}

/** The initial invitation goes out only for a brand-new, confirmed save. */
export function shouldSendInvite(result: string, isHoneypot: boolean): boolean {
  return !isHoneypot && result === "persisted";
}

export type CodeCheck =
  | { outcome: "valid" }
  | { outcome: "expired" | "used" | "mismatch" | "locked" };

export function checkCode(row: {
  code_hash: string;
  expires_at: string;
  used_at: string | null;
  attempts: number;
}, candidateHash: string, now: Date): CodeCheck {
  if (row.used_at) return { outcome: "used" };
  if (row.attempts >= CODE_MAX_ATTEMPTS) return { outcome: "locked" };
  if (new Date(row.expires_at).getTime() <= now.getTime()) return { outcome: "expired" };
  if (row.code_hash !== candidateHash) return { outcome: "mismatch" };
  return { outcome: "valid" };
}
