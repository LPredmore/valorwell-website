import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  communicationConsent: z.literal(true),
  company: z.string().max(200).optional().default(""),
  submissionKey: z.string().max(200).optional().default(""),
});

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

import {
  type DbError,
  type IntakeResult,
  type StoredSubmission,
  isDatabaseUnavailable,
  isUniqueViolation,
  matchesSubmission,
  outageAlertKey,
} from "./logic.ts";

const UNAVAILABLE_MESSAGE =
  "Our system is having trouble right now, so we could not confirm your registration. Please try again in a few minutes.";

type Stage = "insert" | "verify_lookup" | "unexpected";

// Routine log line: submission key + request id only, never names or emails.
function logEvent(level: "info" | "error", fields: {
  requestId: string; submissionKey: string; stage: Stage; result: IntakeResult | "honeypot";
  category?: string; code?: string | null; httpStatus?: number; recovery: "none" | "retry_pending" | "manual_attention";
}) {
  const line = { fn: "register-clinician-interest", at: new Date().toISOString(), ...fields };
  if (level === "error") console.error(JSON.stringify(line));
  else console.log(JSON.stringify(line));
}

// Deduplicated outage alert: Resend's Idempotency-Key collapses every alert
// within the same UTC hour into one email. No applicant details are included.
async function alertOutage(fields: { requestId: string; submissionKey: string; code: string | null | undefined }) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return;
  const key = outageAlertKey(new Date());
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify({
        from: "ValorWell Alerts <noreply@valorwell.org>",
        to: ["info@valorwell.org"],
        subject: "Clinician registrations are failing (database unavailable)",
        html: `<p>At least one clinician interest registration could not be saved this hour because Billing Hub was unavailable. Applicants were told their registration was not confirmed and asked to retry.</p>
<p>First failure this hour: submission key <code>${fields.submissionKey.replace(/[^\w-]/g, "")}</code>, request <code>${fields.requestId}</code>, code <code>${String(fields.code ?? "none").replace(/[^\w-]/g, "")}</code>.</p>
<p>To count affected submissions, search the register-clinician-interest logs for <code>"result":"indeterminate"</code> and check each key against website_submissions.source_record_key after recovery. You will get at most one of these emails per hour.</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (_e) {
    // Alerting must never change the applicant's result.
  }
}

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, message: "Method not allowed" }),
      { status: 405, headers: jsonHeaders },
    );
  }

  try {
    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          result: "validation_failed",
          message: "Invalid submission.",
          errors: parsed.error.flatten().fieldErrors,
        }),
        { status: 400, headers: jsonHeaders },
      );
    }

    const {
      firstName,
      lastName,
      email,
      communicationConsent,
      company,
      submissionKey,
    } = parsed.data;

    const requestId = crypto.randomUUID();

    // Honeypot: look successful to bots; the website never tracks these.
    if (company && company.trim().length > 0) {
      logEvent("info", { requestId, submissionKey: "honeypot", stage: "insert", result: "honeypot", recovery: "none" });
      return respond(200, { ok: true, result: "persisted", lifecycle: "interest_recorded" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase environment not configured");
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const normalizedEmail = email.toLowerCase();
    const sourceKey =
      submissionKey && submissionKey.length > 0
        ? submissionKey
        : `clinician-interest-${crypto.randomUUID()}`;
    const expected = { firstName, lastName, email: normalizedEmail };

    const lookup = async (): Promise<{ row: StoredSubmission | null; error: DbError }> => {
      const { data, error } = await admin
        .from("website_submissions")
        .select("id, submission_type, payload")
        .eq("tenant_id", TENANT_ID)
        .eq("source_system", "website")
        .eq("source_record_key", sourceKey)
        .maybeSingle();
      return { row: (data as StoredSubmission | null) ?? null, error };
    };

    const { data: inserted, error: insertError } = await admin
      .from("website_submissions")
      .insert({
        tenant_id: TENANT_ID,
        submission_type: "clinician_application",
        normalized_lane: "provider_recruiting",
        source_system: "website",
        source_record_key: sourceKey,
        consent: communicationConsent,
        source_page: req.headers.get("referer") ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
        payload: {
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          source: "clinician_interest_form",
        },
      })
      .select("id")
      .single();

    if (!insertError && inserted?.id) {
      logEvent("info", { requestId, submissionKey: sourceKey, stage: "insert", result: "persisted", recovery: "none" });
      return respond(200, { ok: true, result: "persisted", lifecycle: "interest_recorded", submissionId: inserted.id, requestId });
    }

    // Unique violation, or a write whose outcome is unknown: resolve by the
    // original key instead of assuming success.
    if (isUniqueViolation(insertError) || isDatabaseUnavailable(insertError)) {
      const { row, error: lookupError } = await lookup();
      if (!lookupError && row) {
        if (matchesSubmission(row, expected)) {
          logEvent("info", { requestId, submissionKey: sourceKey, stage: "verify_lookup", result: "verified_duplicate", code: insertError?.code, recovery: "none" });
          return respond(200, { ok: true, result: "verified_duplicate", lifecycle: "interest_recorded", submissionId: row.id, requestId });
        }
        logEvent("error", { requestId, submissionKey: sourceKey, stage: "verify_lookup", result: "key_conflict", code: insertError?.code, httpStatus: 409, recovery: "retry_pending" });
        return respond(409, { ok: false, result: "key_conflict", retryable: true, newKeyRequired: true, requestId,
          message: "We could not confirm your registration. Please submit the form again." });
      }
      if (isUniqueViolation(insertError) && !lookupError) {
        // Uniqueness tripped on something other than our key; not a confirmed write.
        logEvent("error", { requestId, submissionKey: sourceKey, stage: "verify_lookup", result: "indeterminate", category: "unique_other", code: insertError?.code, httpStatus: 500, recovery: "manual_attention" });
        return respond(500, { ok: false, result: "indeterminate", retryable: true, requestId, message: UNAVAILABLE_MESSAGE });
      }
      if (!lookupError && !row && isDatabaseUnavailable(insertError)) {
        // Database answered the lookup and has no row: the write did not land.
        logEvent("error", { requestId, submissionKey: sourceKey, stage: "insert", result: "indeterminate", category: "database_unavailable", code: insertError?.code, httpStatus: 503, recovery: "retry_pending" });
        await alertOutage({ requestId, submissionKey: sourceKey, code: insertError?.code });
        return respond(503, { ok: false, result: "indeterminate", retryable: true, requestId, message: UNAVAILABLE_MESSAGE });
      }
      logEvent("error", { requestId, submissionKey: sourceKey, stage: "verify_lookup", result: "indeterminate", category: "database_unavailable", code: lookupError?.code ?? insertError?.code, httpStatus: 503, recovery: "retry_pending" });
      await alertOutage({ requestId, submissionKey: sourceKey, code: lookupError?.code ?? insertError?.code });
      return respond(503, { ok: false, result: "indeterminate", retryable: true, requestId, message: UNAVAILABLE_MESSAGE });
    }

    logEvent("error", { requestId, submissionKey: sourceKey, stage: "insert", result: "validation_failed", category: "insert_rejected", code: insertError?.code, httpStatus: 422, recovery: "manual_attention" });
    return respond(422, { ok: false, result: "validation_failed", retryable: false, requestId,
      message: "We could not save your registration. Please check your details or email info@valorwell.org." });
  } catch (err) {
    console.error(JSON.stringify({ fn: "register-clinician-interest", at: new Date().toISOString(), stage: "unexpected", result: "indeterminate", category: err instanceof Error ? err.name : "unknown", recovery: "retry_pending" }));
    return respond(500, { ok: false, result: "indeterminate", retryable: true, message: UNAVAILABLE_MESSAGE });
  }
});
