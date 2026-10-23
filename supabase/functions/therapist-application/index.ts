import "jsr:@supabase/functions-js@2.4.5/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.93.1";
import {
  CODES_PER_EMAIL_PER_HOUR,
  CODE_LENGTH,
  CODE_MAX_ATTEMPTS,
  CODE_TTL_MINUTES,
  SESSION_TTL_SECONDS,
  TENANT_ID,
  checkCode,
  isValidEmail,
  normalizeEmail,
  validateStepOne,
  validateStepThree,
  validateStepTwo,
} from "./logic.ts";
import { sendTherapistInvite, type InviteRow } from "../_shared/therapistInvite.ts";
import {
  validateApplicantProfile,validateApplicantDisclosures,validateApplicantEmployment,
  validateApplicantAttestation,type ApplicantDetails
} from "../_shared/therapistProfessional.ts";
import {parseResume} from "../_shared/therapistResume.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const respond = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" },
  });

const GENERIC_CODE_MESSAGE =
  "If that email matches a registration we have on file, a verification code is on its way.";

function admin(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Application service is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function keySecret(): string {
  const secret = Deno.env.get("THERAPIST_APPLICATION_SIGNING_SECRET")
    || Deno.env.get("CLINICIAN_SCHEDULER_SIGNING_SECRET")
    || Deno.env.get("BTY_SCHEDULER_SIGNING_SECRET")
    || Deno.env.get("OAUTH_STATE_SIGNING_SECRET");
  if (!secret) throw new Error("Application signing secret is missing.");
  return secret;
}

const b64 = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
};
const unb64 = (s: string) =>
  Uint8Array.from(
    atob(s.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(s.length / 4) * 4, "=")),
    (c) => c.charCodeAt(0),
  );

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw", new TextEncoder().encode(keySecret()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
  );
}

async function issueSession(applicationId: string, email: string): Promise<string> {
  const payload = b64(new TextEncoder().encode(JSON.stringify({
    applicationId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    scope: "therapist-application",
  })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(payload));
  return `${payload}.${b64(new Uint8Array(sig))}`;
}

async function readSession(token: unknown): Promise<{ applicationId: string; email: string }> {
  const value = String(token ?? "");
  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1] || value.length > 3000) {
    throw new Error("Your application session is invalid or expired. Verify your email again.");
  }
  let valid = false;
  try {
    valid = await crypto.subtle.verify("HMAC", await hmacKey(), unb64(parts[1]), new TextEncoder().encode(parts[0]));
  } catch { /* malformed signature */ }
  if (!valid) throw new Error("Your application session is invalid or expired. Verify your email again.");
  const payload = JSON.parse(new TextDecoder().decode(unb64(parts[0])));
  if (payload.scope !== "therapist-application" || payload.exp <= Date.now() / 1000 || !payload.applicationId) {
    throw new Error("Your application session is invalid or expired. Verify your email again.");
  }
  return { applicationId: String(payload.applicationId), email: normalizeEmail(payload.email) };
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateCode(): string {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return String(buffer[0] % 1000000).padStart(CODE_LENGTH, "0");
}

// In-memory per-IP rate limiting (same pattern as the interview scheduler).
const buckets = new Map<string, { count: number; until: number }>();
function ipAllowed(req: Request, limit: number, windowMs: number): boolean {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const old = buckets.get(ip);
  if (!old || old.until < now) {
    buckets.set(ip, { count: 1, until: now + windowMs });
    return true;
  }
  if (old.count >= limit) return false;
  old.count++;
  return true;
}

type Identity = {
  submissionId: string | null;
  applicantId: string | null;
  firstName: string | null;
  lastName: string | null;
};

// Email is the linking key. Matches the authoritative website interest
// submission and/or an existing provider applicant; never matches on name.
async function findIdentity(db: SupabaseClient, email: string): Promise<Identity | null> {
  const { data: submissions, error: subError } = await db
    .from("website_submissions")
    .select("id, payload")
    .eq("tenant_id", TENANT_ID)
    .eq("source_system", "website")
    .eq("submission_type", "clinician_application")
    .eq("payload->>email", email)
    .order("submitted_at", { ascending: false })
    .limit(1);
  if (subError) throw new Error("Registration lookup is unavailable.");

  const { data: applicants, error: appError } = await db
    .from("provider_applicants")
    .select("id, email, first_name, last_name, created_at")
    .eq("tenant_id", TENANT_ID)
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(10);
  if (appError) throw new Error("Registration lookup is unavailable.");

  const submission = (submissions ?? [])[0] as
    | { id: string; payload: { first_name?: string; last_name?: string } }
    | undefined;
  const applicant = (applicants ?? []).find((row) => normalizeEmail(row.email) === email) as
    | { id: string; first_name: string | null; last_name: string | null }
    | undefined;

  if (!submission && !applicant) return null;
  return {
    submissionId: submission?.id ?? null,
    applicantId: applicant?.id ?? null,
    firstName: submission?.payload?.first_name ?? applicant?.first_name ?? null,
    lastName: submission?.payload?.last_name ?? applicant?.last_name ?? null,
  };
}

type ApplicationRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  license_category: string | null;
  states: string[];
  license_numbers: Record<string, string>;
  npi: string | null;
  npi_declared: boolean | null;
  details: ApplicantDetails;
  provider_applicant_id: string | null;
  source_submission_id: string | null;
  status: "in_progress" | "submitted";
  completed_at: string | null;
};

function serialize(row: ApplicationRow) {
  return {
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    licenseCategory: row.license_category,
    states: row.states ?? [],
    licenseNumbers: row.license_numbers ?? {},
    npi: row.npi,
    npiDeclared: row.npi_declared,
    details: row.details ?? {},
    status: row.status,
    completedAt: row.completed_at,
  };
}

async function loadApplication(db: SupabaseClient, id: string): Promise<ApplicationRow> {
  const { data, error } = await db
    .from("therapist_applications")
    .select("id,email,first_name,last_name,license_category,states,license_numbers,npi,npi_declared,details,provider_applicant_id,source_submission_id,status,completed_at")
    .eq("tenant_id", TENANT_ID)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error("Your application could not be loaded. Please try again.");
  return data as ApplicationRow;
}

async function getOrCreateApplication(db: SupabaseClient, email: string, identity: Identity): Promise<ApplicationRow> {
  const { data: existing, error: readError } = await db
    .from("therapist_applications")
    .select("id,email,first_name,last_name,license_category,states,license_numbers,npi,npi_declared,details,provider_applicant_id,source_submission_id,status,completed_at")
    .eq("tenant_id", TENANT_ID)
    .eq("email", email)
    .maybeSingle();
  if (readError) throw new Error("Your application could not be loaded. Please try again.");
  if (existing) return existing as ApplicationRow;

  const { data: created, error: insertError } = await db
    .from("therapist_applications")
    .insert({
      tenant_id: TENANT_ID,
      email,
      source_submission_id: identity.submissionId,
      provider_applicant_id: identity.applicantId,
      first_name: identity.firstName,
      last_name: identity.lastName,
    })
    .select("id,email,first_name,last_name,license_category,states,license_numbers,npi,npi_declared,details,provider_applicant_id,source_submission_id,status,completed_at")
    .single();
  if (insertError) {
    // Concurrent verify for the same email: read the row the other request made.
    if (insertError.code === "23505") {
      const { data: raced } = await db
        .from("therapist_applications")
        .select("id,email,first_name,last_name,license_category,states,license_numbers,npi,npi_declared,details,provider_applicant_id,source_submission_id,status,completed_at")
        .eq("tenant_id", TENANT_ID)
        .eq("email", email)
        .maybeSingle();
      if (raced) return raced as ApplicationRow;
    }
    throw new Error("Your application could not be started. Please try again.");
  }
  return created as ApplicationRow;
}

async function sendCodeEmail(email: string, code: string): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return false;
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ValorWell <noreply@valorwell.org>",
        reply_to: "info@valorwell.org",
        to: [email],
        subject: "Your ValorWell verification code",
        html: `<div style="font-family: Trebuchet MS, Verdana, sans-serif; color: #111814; line-height: 1.6; max-width: 560px;">
<p>Your ValorWell therapist application verification code is:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 20px 0;">${code}</p>
<p>This code expires in ${CODE_TTL_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
<p>— The ValorWell team</p>
</div>`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return result.ok;
  } catch {
    return false;
  }
}

async function requestCode(db: SupabaseClient, req: Request, input: Record<string, unknown>) {
  if (!ipAllowed(req, 10, 10 * 60 * 1000)) {
    return respond({ ok: false, error: "Too many attempts. Please try again later." }, 429);
  }
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    // Invalid input gets the same generic answer as a real miss: no enumeration.
    return respond({ ok: true, message: GENERIC_CODE_MESSAGE });
  }

  // Per-email send limit, enforced in the database so it survives restarts.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await db
    .from("therapist_application_codes")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .eq("email", email)
    .gte("created_at", hourAgo);
  if (countError) throw new Error("Verification is temporarily unavailable. Please try again later.");
  if ((count ?? 0) >= CODES_PER_EMAIL_PER_HOUR) {
    return respond({ ok: true, message: GENERIC_CODE_MESSAGE });
  }

  const identity = await findIdentity(db, email);
  if (!identity) return respond({ ok: true, message: GENERIC_CODE_MESSAGE });

  const code = generateCode();
  const { error: insertError } = await db.from("therapist_application_codes").insert({
    tenant_id: TENANT_ID,
    email,
    code_hash: await sha256Hex(code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
  });
  if (insertError) throw new Error("Verification is temporarily unavailable. Please try again later.");

  const sent = await sendCodeEmail(email, code);
  if (!sent) {
    console.error(JSON.stringify({ fn: "therapist-application", stage: "request_code", result: "email_failed" }));
    throw new Error("We could not send the verification email. Please try again in a few minutes.");
  }
  return respond({ ok: true, message: GENERIC_CODE_MESSAGE });
}

async function verifyCode(db: SupabaseClient, req: Request, input: Record<string, unknown>) {
  if (!ipAllowed(req, 20, 10 * 60 * 1000)) {
    return respond({ ok: false, error: "Too many attempts. Please try again later." }, 429);
  }
  const email = normalizeEmail(input.email);
  const code = String(input.code ?? "").trim();
  const invalid = { ok: false, error: "That code is invalid or has expired. Request a new one." };
  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) return respond(invalid, 400);

  const { data: rows, error } = await db
    .from("therapist_application_codes")
    .select("id, code_hash, expires_at, used_at, attempts")
    .eq("tenant_id", TENANT_ID)
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error("Verification is temporarily unavailable. Please try again later.");
  const row = (rows ?? [])[0];
  if (!row) return respond(invalid, 400);

  const check = checkCode(row, await sha256Hex(code), new Date());
  if (check.outcome !== "valid") {
    if (check.outcome === "mismatch") {
      await db.from("therapist_application_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    }
    return respond(invalid, 400);
  }

  await db.from("therapist_application_codes")
    .update({ used_at: new Date().toISOString() }).eq("id", row.id);

  const identity = await findIdentity(db, email);
  if (!identity) return respond(invalid, 400);
  const application = await getOrCreateApplication(db, email, identity);
  const sessionToken = await issueSession(application.id, email);
  return respond({ ok: true, sessionToken, expiresInSeconds: SESSION_TTL_SECONDS, application: serialize(application) });
}

async function authenticated(input: Record<string, unknown>): Promise<{ applicationId: string; email: string }> {
  return readSession(input.sessionToken);
}

async function save(db: SupabaseClient, session: { applicationId: string; email: string }, input: Record<string, unknown>) {
  const application = await loadApplication(db, session.applicationId);
  if (normalizeEmail(application.email) !== session.email) {
    throw new Error("Your application session is invalid or expired. Verify your email again.");
  }
  if (application.status === "submitted") {
    return respond({ ok: true, application: serialize(application) });
  }

  const step = Number(input.step);
  const patch: Record<string, unknown> = {};
  if (step === 1) {
    const parsed = validateStepOne({ licenseCategory: input.licenseCategory, states: input.states });
    if (!parsed.ok) return respond({ ok: false, error: parsed.error }, 400);
    patch.license_category = parsed.value.licenseCategory;
    patch.states = parsed.value.states;
    // Dropped states must not keep stale license numbers.
    const kept: Record<string, string> = {};
    for (const state of parsed.value.states) {
      const existing = application.license_numbers?.[state];
      if (existing) kept[state] = existing;
    }
    patch.license_numbers = kept;
  } else if (step === 2) {
    if (!application.states?.length) {
      return respond({ ok: false, error: "Choose your states first." }, 400);
    }
    const parsed = validateStepTwo(application.states, input.licenseNumbers);
    if (!parsed.ok) return respond({ ok: false, error: parsed.error }, 400);
    patch.license_numbers = parsed.value;
  } else if (step === 3) {
    const parsed = validateStepThree({ hasNpi: input.hasNpi, npi: input.npi });
    if (!parsed.ok) return respond({ ok: false, error: parsed.error }, 400);
    patch.npi_declared = parsed.value.npiDeclared;
    patch.npi = parsed.value.npi;
  } else if (step === 4) {
    const parsed = validateApplicantProfile(input.profile);
    if (!parsed.ok) return respond({ok:false,error:parsed.error},400);
    patch.first_name = parsed.value.firstName;
    patch.last_name = parsed.value.lastName;
    patch.details = {...(application.details ?? {}),profile:parsed.value};
  } else if (step === 5) {
    const parsed = validateApplicantDisclosures(input.disclosures);
    if (!parsed.ok) return respond({ok:false,error:parsed.error},400);
    patch.details = {...(application.details ?? {}),disclosures:parsed.value};
  } else if (step === 6) {
    const parsed = validateApplicantEmployment(input.employment);
    if (!parsed.ok) return respond({ok:false,error:parsed.error},400);
    patch.details = {...(application.details ?? {}),employment:parsed.value};
  } else if (step === 7) {
    const parsed = validateApplicantAttestation(input.attestation);
    if (!parsed.ok) return respond({ok:false,error:parsed.error},400);
    patch.details = {...(application.details ?? {}),attestation:{...parsed.value,attestedAt:new Date().toISOString()}};
  } else {
    return respond({ ok: false, error: "Unknown application step." }, 400);
  }

  const { data: updated, error } = await db
    .from("therapist_applications")
    .update(patch)
    .eq("id", application.id)
    .eq("status", "in_progress")
    .select("id,email,first_name,last_name,license_category,states,license_numbers,npi,npi_declared,details,provider_applicant_id,source_submission_id,status,completed_at")
    .maybeSingle();
  if (error) throw new Error("Your answers could not be saved. Please try again.");
  return respond({ ok: true, application: serialize((updated ?? application) as ApplicationRow) });
}

async function complete(db: SupabaseClient, session: { applicationId: string; email: string }) {
  const application = await loadApplication(db, session.applicationId);
  if (normalizeEmail(application.email) !== session.email) {
    throw new Error("Your application session is invalid or expired. Verify your email again.");
  }
  if (application.status === "submitted") {
    return respond({ ok: true, application: serialize(application) });
  }

  // Re-validate everything server-side before accepting completion.
  const stepOne = validateStepOne({ licenseCategory: application.license_category, states: application.states });
  if (!stepOne.ok) return respond({ ok: false, error: stepOne.error, step: 1 }, 400);
  const stepTwo = validateStepTwo(stepOne.value.states, application.license_numbers);
  if (!stepTwo.ok) return respond({ ok: false, error: stepTwo.error, step: 2 }, 400);
  if (application.npi_declared === null || application.npi_declared === undefined) {
    return respond({ ok: false, error: "Tell us whether you have an NPI number.", step: 3 }, 400);
  }
  const stepThree = validateStepThree({ hasNpi: application.npi_declared, npi: application.npi });
  if (!stepThree.ok) return respond({ ok: false, error: stepThree.error, step: 3 }, 400);


  const profile = validateApplicantProfile(application.details?.profile);
  if (!profile.ok) return respond({ok:false,error:profile.error,step:4},400);
  const disclosures=validateApplicantDisclosures(application.details?.disclosures);
  if (!disclosures.ok) return respond({ok:false,error:disclosures.error,step:5},400);
  const employment=validateApplicantEmployment(application.details?.employment);
  if (!employment.ok) return respond({ok:false,error:employment.error,step:6},400);
  const attestation=validateApplicantAttestation(application.details?.attestation);
  if (!attestation.ok) return respond({ok:false,error:attestation.error,step:7},400);

  // Single database transaction serializes identity linking, CRM upsert,
  // website submission routing and final application status. Existing
  // Legacy/Indeed applicants keep their owner, status and manual notes.
  const {error} = await db.rpc("crm_finalize_therapist_professional_application",{
    p_application_id:application.id
  });
  if (error) {
    console.error(JSON.stringify({fn:"therapist-application",stage:"finalize",code:error.code}));
    throw new Error("Your application could not be finalized. Please try again.");
  }
  const updated=await loadApplication(db,application.id);
  return respond({ok:true,application:serialize(updated)});

}

// Cron-only retry sweep for invitation emails that failed their first send.
// Guarded by x-cron-secret; safe to call any number of times.
async function sendPendingInvites(db: SupabaseClient, req: Request) {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return respond({ error: "Unauthorized." }, 401);
  }
  const cutoff = new Date(Date.now() - 60 * 1000).toISOString();
  const { data: invites, error } = await db
    .from("therapist_application_invites")
    .select("id, email, status")
    .eq("tenant_id", TENANT_ID)
    .in("status", ["pending", "failed"])
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(10);
  if (error) throw new Error("Invite sweep is unavailable.");
  let sent = 0;
  let failed = 0;
  for (const invite of (invites ?? []) as InviteRow[]) {
    const outcome = await sendTherapistInvite(db, invite, null);
    if (outcome === "sent") sent++;
    else failed++;
  }
  return respond({ ok: true, checked: (invites ?? []).length, sent, failed });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return respond({ error: "Method not allowed." }, 405);
  try {
    const input = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const db = admin();
    const action = String(input.action ?? "");
    if (action === "request_code") return await requestCode(db, req, input);
    if (action === "verify_code") return await verifyCode(db, req, input);
    if (action === "send_pending_invites") return await sendPendingInvites(db, req);

    const session = await authenticated(input);
    if (action === "parse_resume") {
      const application=await loadApplication(db,session.applicationId);
      if (normalizeEmail(application.email)!==session.email || application.status==="submitted")
        return respond({ok:false,error:"Your application is not available for edits."},403);
      try {
        const entries=await parseResume(input);
        return respond({ok:true,entries});
      } catch (err) {
        const safe=err instanceof Error?err.message:"Could not parse the résumé.";
        return respond({ok:false,error:safe},400);
      }
    }
    if (action === "session") {
      const application = await loadApplication(db, session.applicationId);
      return respond({ ok: true, application: serialize(application) });
    }
    if (action === "save") return await save(db, session, input);
    if (action === "complete") return await complete(db, session);
    return respond({ error: "Unknown action." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("therapist-application", message);
    const status = /session|expired/i.test(message) ? 401 : 500;
    return respond(
      { error: status === 500 ? "The application is temporarily unavailable. Please email info@valorwell.org." : message },
      status,
    );
  }
});
