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

const UNAVAILABLE_MESSAGE =
  "Our system is having trouble right now and your application was not saved. Please try again in a few minutes.";

// Errors that mean the database is unreachable/overloaded, not that the data is bad.
function isDatabaseUnavailable(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = err.message ?? "";
  return (
    /^PGRST00[0-3]$/.test(code) ||
    code === "57014" || code === "53300" || code === "08006" || code === "08001" ||
    /timeout|timed out|connection|fetch failed|50[234]|schema cache/i.test(msg)
  );
}

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Alert staff so a failed application can be followed up by hand. Never throws.
async function alertStaff(details: { submissionKey: string; firstName: string; lastName: string; email: string; reason: string }) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("register-clinician-interest alert skipped: RESEND_API_KEY missing", { submissionKey: details.submissionKey });
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ValorWell Alerts <noreply@valorwell.org>",
        to: ["info@valorwell.org"],
        subject: "Clinician application could not be saved",
        html: `<p>A clinician application failed to save and the applicant was asked to try again.</p>
<ul><li>Name: ${escapeHtml(details.firstName)} ${escapeHtml(details.lastName)}</li>
<li>Email: ${escapeHtml(details.email)}</li>
<li>Submission key: ${escapeHtml(details.submissionKey)}</li>
<li>Reason: ${escapeHtml(details.reason)}</li></ul>
<p>If no matching website_submissions row appears later, follow up with this applicant directly.</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("register-clinician-interest alert failed", { status: res.status, submissionKey: details.submissionKey });
  } catch (e) {
    console.error("register-clinician-interest alert error", { submissionKey: details.submissionKey, error: String(e) });
  }
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

    // Honeypot: silently succeed on bot submissions.
    if (company && company.trim().length > 0) {
      return new Response(
        JSON.stringify({ ok: true, lifecycle: "invite_sent" }),
        { status: 200, headers: jsonHeaders },
      );
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
        : `clinician-interest-${normalizedEmail}-${Date.now()}`;

    const { error: insertError } = await admin
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
      });

    if (insertError) {
      // Treat duplicate submission_key as success (idempotent double-submit).
      const msg = insertError.message ?? "";
      if (insertError.code === "23505" || /duplicate key/i.test(msg)) {
        return new Response(
          JSON.stringify({ ok: true, lifecycle: "invite_sent" }),
          { status: 200, headers: jsonHeaders },
        );
      }
      const unavailable = isDatabaseUnavailable(insertError);
      console.error("register-clinician-interest insert failed:", {
        submissionKey: sourceKey,
        kind: unavailable ? "database_unavailable" : "insert_rejected",
        code: insertError.code,
        message: insertError.message,
      });
      await alertStaff({ submissionKey: sourceKey, firstName, lastName, email: normalizedEmail, reason: `${insertError.code ?? ""} ${insertError.message ?? ""}`.trim() });
      return new Response(
        JSON.stringify({
          ok: false,
          retryable: unavailable,
          message: unavailable ? UNAVAILABLE_MESSAGE : "We could not save your application. Please try again.",
        }),
        { status: unavailable ? 503 : 500, headers: jsonHeaders },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, lifecycle: "invite_sent" }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (err) {
    console.error("register-clinician-interest failed:", { kind: "unexpected", error: String(err) });
    return new Response(
      JSON.stringify({ ok: false, retryable: true, message: UNAVAILABLE_MESSAGE }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
