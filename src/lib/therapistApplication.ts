// Frontend constants and validation for the /therapistapplication flow.
// Mirrors supabase/functions/therapist-application/logic.ts; the edge function
// re-validates everything server-side, so these exist for UX feedback only.

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

export const LICENSE_CATEGORIES: ReadonlyArray<{ value: string; label: string; equivalents: string }> = [
  { value: "clinical_social_worker", label: "Clinical Social Worker", equivalents: "LCSW, LICSW, LISW" },
  { value: "professional_counselor", label: "Professional Counselor", equivalents: "LPC, LCPC, LPCC" },
  { value: "mental_health_counselor", label: "Mental Health Counselor", equivalents: "LMHC" },
  { value: "marriage_family_therapist", label: "Marriage and Family Therapist", equivalents: "LMFT" },
  { value: "psychologist", label: "Psychologist", equivalents: "Licensed Psychologist (PhD or PsyD)" },
  { value: "other_independent", label: "Other independently licensed mental health therapist", equivalents: "" },
];

export const MAX_LICENSE_NUMBER_LENGTH = 64;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

export type TherapistApplication = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  licenseCategory: string | null;
  states: string[];
  licenseNumbers: Record<string, string>;
  npi: string | null;
  npiDeclared: boolean | null;
  details?: import("@/lib/therapistProfessional").ApplicantDetails;
  status: "in_progress" | "submitted";
  completedAt: string | null;
};
