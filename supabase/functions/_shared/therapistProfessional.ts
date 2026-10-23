// Shared browser/server form contracts; this public data contains no applicant PII.
// Pre-interview disclosures deliberately exclude criminal history (15-17) and
// disability/medical/essential-functions questions (18-20). Those belong in
// a separately reviewed later process, not automatic hiring screening.
export type DisclosureQuestion = { number: number; category: string; text: string; showWhen?: "board_certified"; requiresExplanationWhen: boolean };

export const ALL_DISCLOSURES: readonly DisclosureQuestion[] = [
  { number: 1, category: "Licensure", text: "Has any professional license or certification you hold or have held ever been denied, suspended, revoked, restricted, placed on probation, or subject to a consent order?", requiresExplanationWhen: true },
  { number: 2, category: "Licensure", text: "Have you ever voluntarily surrendered, withdrawn, or failed to renew a professional license or certification while under investigation or to avoid an investigation or disciplinary action?", requiresExplanationWhen: true },
  { number: 3, category: "Licensure", text: "Have you ever been formally reprimanded, censured, or fined by a licensing board or professional regulatory body?", requiresExplanationWhen: true },
  { number: 4, category: "Licensure", text: "Is any licensing board action, complaint, or investigation involving you currently pending?", requiresExplanationWhen: true },
  { number: 5, category: "Employment", text: "Has your employment, contract, or independent-contractor relationship with any behavioral-health employer, agency, or group practice ever been terminated, suspended, or not renewed for reasons related to clinical competence or professional conduct?", requiresExplanationWhen: true },
  { number: 6, category: "Managed care", text: "Have you ever been denied participation in, terminated from, suspended from, or placed under restriction by any health plan, managed-care organization, provider network, or payer?", requiresExplanationWhen: true },
  { number: 7, category: "Education & training", text: "Have you ever been placed on probation, suspended, dismissed, or subjected to disciplinary action by a graduate program, internship, practicum, residency, or supervised-experience program?", requiresExplanationWhen: true },
  { number: 8, category: "Program participation", text: "Have you ever been excluded, debarred, suspended, or otherwise made ineligible to participate in Medicare, Medicaid, TRICARE, or any other federal or state health care program?", requiresExplanationWhen: true },
  { number: 9, category: "Program participation", text: "Have you ever been sanctioned, fined, or subject to a civil monetary penalty by any federal or state health care program or agency?", requiresExplanationWhen: true },
  { number: 10, category: "Reporting", text: "Has any report concerning you ever been submitted to the National Practitioner Data Bank (NPDB) or a comparable state or professional data bank?", requiresExplanationWhen: true },
  { number: 11, category: "Professional conduct", text: "Have you ever been the subject of a complaint, investigation, or finding involving sexual misconduct, boundary violations, or exploitation of a client?", requiresExplanationWhen: true },
  { number: 12, category: "Professional conduct", text: "Have you ever been the subject of a complaint, investigation, or finding of professional misconduct, unethical conduct, or violation of a professional code of ethics?", requiresExplanationWhen: true },
  { number: 13, category: "Professional liability", text: "Has any professional liability insurance carrier ever cancelled, non-renewed, declined, or refused to issue coverage to you, or issued coverage with special limitations, exclusions, or a high-risk rating or surcharge?", requiresExplanationWhen: true },
  { number: 14, category: "Professional liability", text: "Have any professional liability claims, lawsuits, arbitrations, or settlements ever been made or paid on your behalf?", requiresExplanationWhen: true },
  { number: 15, category: "Legal", text: "Have you ever been convicted of, pled guilty or no contest to, or entered a diversion program for a felony?", requiresExplanationWhen: true },
  { number: 16, category: "Legal", text: "Have you ever been convicted of, pled guilty or no contest to, or been found civilly liable for fraud, theft, or misrepresentation, including health care fraud or abuse?", requiresExplanationWhen: true },
  { number: 17, category: "Legal", text: "Have you ever been convicted of, pled guilty or no contest to, or been the subject of a substantiated finding involving violence, child abuse or neglect, elder abuse, or a sexual offense?", requiresExplanationWhen: true },
  { number: 18, category: "Impairment", text: "Do you currently use illegal drugs, or do you have a substance-use condition that is not being successfully treated and that could impair your ability to practice safely?", requiresExplanationWhen: true },
  { number: 19, category: "Impairment", text: "Do you have any physical or behavioral-health condition that currently impairs your ability to practice safely, or that presents a risk to client safety?", requiresExplanationWhen: true },
  { number: 20, category: "Essential functions", text: "Are you currently unable, with or without reasonable accommodation, to perform the essential professional functions of your position, including providing clinical services and maintaining clinical records?", requiresExplanationWhen: true },
  { number: 21, category: "Board certification", text: "Has any professional board certification you hold ever been denied, revoked, suspended, restricted, or allowed to lapse while under review?", showWhen: "board_certified", requiresExplanationWhen: true },
  { number: 22, category: "Board certification", text: "Is any board-certification review, complaint, or recertification deficiency involving you currently pending?", showWhen: "board_certified", requiresExplanationWhen: true },
];

export const PRE_INTERVIEW_DISCLOSURES: readonly DisclosureQuestion[] =
  ALL_DISCLOSURES.filter(q => q.number <= 14 || q.number >= 21);
export type ApplicantProfile = {
  firstName: string; middleName: string; lastName: string;
  phone: string; taxonomy: string; languages: string[];
};
export type DisclosureAnswer = { answer: boolean | null; explanation: string };
export type ApplicantDisclosures = { boardCertified: boolean | null; answers: Record<string, DisclosureAnswer> };
export type Employment = {
  employer: string; title: string; start: string; end: string;
  city: string; state: string; summary: string; current: boolean;
};
export type ApplicantEmployment = { choice: "skip" | "manual" | "resume" | null; entries: Employment[] };
export type Attestation = { accepted: boolean; legalName: string };
export type ApplicantDetails = {
  profile?: ApplicantProfile; disclosures?: ApplicantDisclosures;
  employment?: ApplicantEmployment; attestation?: Attestation;
};

const plain = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };
export const LANGUAGES = [
  "English", "Spanish", "American Sign Language (ASL)", "Arabic", "Chinese (Mandarin)",
  "Chinese (Cantonese)", "French", "German", "Haitian Creole", "Hindi", "Korean",
  "Portuguese", "Russian", "Tagalog", "Vietnamese", "Other"
] as const;

export function validateApplicantProfile(value: unknown): Validated<ApplicantProfile> {
  if (!object(value)) return { ok: false, error: "Complete your professional contact information." };
  const firstName = plain(value.firstName,100), middleName=plain(value.middleName,100), lastName=plain(value.lastName,100);
  const phone = plain(value.phone,40), taxonomy=plain(value.taxonomy,20);
  const languages = Array.isArray(value.languages) ?
    [...new Set(value.languages.filter(x => typeof x === "string" && LANGUAGES.includes(x as typeof LANGUAGES[number])))] as string[] : [];
  if (!firstName || !lastName || !/^[0-9+(). -]{7,40}$/.test(phone))
    return {ok:false,error:"First name, last name and a valid phone number are required."};
  if (taxonomy && !/^[0-9]{10}$/.test(taxonomy))
    return {ok:false,error:"A taxonomy code must contain 10 digits, or be left blank if unknown."};
  if (!languages.length) return {ok:false,error:"Select at least one language you provide therapy in."};
  return {ok:true,value:{firstName,middleName,lastName,phone,taxonomy,languages}};
}

export function validateApplicantDisclosures(value: unknown): Validated<ApplicantDisclosures> {
  if (!object(value) || typeof value.boardCertified !== "boolean" || !object(value.answers))
    return {ok:false,error:"Answer the professional disclosure questions."};
  const selected = PRE_INTERVIEW_DISCLOSURES.filter(q => !q.showWhen || value.boardCertified === true);
  const answers: Record<string,DisclosureAnswer> = {};
  for (const q of selected) {
    const raw = value.answers[String(q.number)];
    if (!object(raw) || typeof raw.answer !== "boolean")
      return {ok:false,error:"Please answer disclosure question " + q.number + "."};
    const explanation = plain(raw.explanation,2000);
    if (raw.answer && !explanation)
      return {ok:false,error:"Please add an explanation for disclosure question " + q.number + "."};
    answers[String(q.number)] = {answer:raw.answer,explanation:raw.answer?explanation:""};
  }
  return {ok:true,value:{boardCertified:value.boardCertified,answers}};
}
export function validateApplicantEmployment(value: unknown): Validated<ApplicantEmployment> {
  if (!object(value) || !["skip","manual","resume"].includes(String(value.choice)))
    return {ok:false,error:"Choose to add or skip employment history."};
  const choice = value.choice as ApplicantEmployment["choice"];
  if (choice === "skip") return {ok:true,value:{choice,entries:[]}};
  if (!Array.isArray(value.entries) || value.entries.length > 20)
    return {ok:false,error:"Employment history must contain no more than 20 positions."};
  const entries: Employment[]=[];
  for (const item of value.entries) {
    if (!object(item)) return {ok:false,error:"Check an employment history entry."};
    const v:Employment={employer:plain(item.employer,180),title:plain(item.title,180),
      start:plain(item.start,60),end:plain(item.end,60),city:plain(item.city,100),
      state:plain(item.state,100),summary:plain(item.summary,1000),current:item.current===true};
    if (!v.employer || !v.title) return {ok:false,error:"Each position needs an employer and a job title."};
    entries.push(v);
  }
  return {ok:true,value:{choice,entries}};
}
export function validateApplicantAttestation(value: unknown): Validated<Attestation> {
  if (!object(value) || value.accepted !== true || plain(value.legalName,200).length < 3)
    return {ok:false,error:"Enter your full legal name and confirm that the application is accurate."};
  return {ok:true,value:{accepted:true,legalName:plain(value.legalName,200)}};
}
