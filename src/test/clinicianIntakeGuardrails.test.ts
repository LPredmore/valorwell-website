import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Guardrails for the clinician qualification flow's hard boundaries:
// the website must never write CRM applicant records or touch CRM campaigns
// (including the paused "Invitation to Interview" campaign), and the initial
// invite email must point at the qualification form — never the interview
// scheduler.
const readFunction = (relative: string) =>
  readFileSync(join(process.cwd(), "supabase", "functions", relative), "utf8");
const registerSource = readFunction("register-clinician-interest/index.ts");
const applicationSource = readFunction("therapist-application/index.ts");
const inviteSource = readFunction("_shared/therapistInvite.ts");

describe("clinician intake guardrails", () => {
  it("register-clinician-interest never writes provider_applicants or CRM campaign tables", () => {
    expect(registerSource).not.toMatch(/\.from\(\s*["']provider_applicants["']/);
    expect(registerSource).not.toMatch(/crm_campaign/i);
    expect(registerSource).not.toMatch(/crm_applicant_interview/);
  });

  it("therapist-application never writes provider_applicants or enrolls in campaigns", () => {
    // Reads for email matching are allowed; writes are not.
    expect(applicationSource).not.toMatch(/\.from\(\s*["']provider_applicants["']\s*\)\s*\.\s*(insert|update|upsert|delete)/);
    expect(applicationSource).not.toMatch(/crm_campaign/i);
    expect(applicationSource).not.toMatch(/crm_applicant_interview/);
  });

  it("the initial invite links to the qualification form, not the interview scheduler", () => {
    expect(inviteSource).toContain("https://valorwell.org/therapistapplication");
    expect(inviteSource).not.toContain("/clinicians/interview");
  });

  it("verification codes are stored hashed, never in plaintext", () => {
    expect(applicationSource).toContain("code_hash");
    expect(applicationSource).not.toMatch(/\.insert\(\{[^}]*\bcode\s*:/);
  });
});
