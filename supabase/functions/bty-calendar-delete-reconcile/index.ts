import "jsr:@supabase/functions-js@2.4.5/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.93.1";

/**
 * BTY-only reconciliation of Google Calendar deletions.
 *
 * One-way: info@valorwell.org Google Calendar -> public.relationship_meetings.
 * Does not change Google events, clinical appointments, CRM contacts, or outreach.
 * A cancelled meeting is preserved for audit but excluded from active scheduling.
 */
const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const CALENDAR_ID = "info@valorwell.org";
const PURPOSES = ["bty_preinterview", "bty_recording"];
const ACTIVE = ["confirmed", "tentative"];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function equalSecret(actual: string, expected: string) {
  if (!expected || !actual || actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service runtime is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type DbClient = ReturnType<typeof adminClient>;
type Meeting = {
  id: string;
  tenant_id: string;
  organization_id: string;
  contact_id: string | null;
  opportunity_id: string | null;
  purpose: string;
  calendar_id: string;
  external_event_id: string | null;
  event_status: string;
  starts_at: string;
  metadata: Record<string, unknown> | null;
};

async function accessToken(admin: DbClient) {
  // Reuse the existing relationship-calendar OAuth connection. Do not use the
  // clinical staff-calendar connection or the personal Google account.
  const { data: connections, error: connectionError } = await admin.rpc(
    "list_bty_scheduler_calendar_connections",
  );
  if (connectionError) throw new Error("Calendar connection discovery failed: " + connectionError.message);
  const matches = (connections ?? []).filter(
    (entry: { google_account_email?: string }) =>
      String(entry.google_account_email ?? "").toLowerCase() === CALENDAR_ID,
  );
  if (matches.length !== 1) throw new Error("Expected exactly one connected ValorWell calendar");
  const { data, error } = await admin.rpc("get_relationship_google_connection_runtime", {
    p_tenant_id: TENANT_ID,
    p_connection_type: "calendar",
    p_connection_id: matches[0].id,
  });
  if (error || !data) throw new Error("ValorWell calendar authorization unavailable");
  const runtime = data as {
    googleAccountEmail?: string;
    calendarId?: string;
    refreshToken?: string;
  };
  if (runtime.googleAccountEmail?.toLowerCase() !== CALENDAR_ID ||
      runtime.calendarId?.toLowerCase() !== CALENDAR_ID ||
      !runtime.refreshToken) {
    throw new Error("Calendar account identity mismatch");
  }
  const clientId = Deno.env.get("GOOGLE_RELATIONSHIPS_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_RELATIONSHIPS_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Relationship Google OAuth secrets unavailable");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: runtime.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.access_token !== "string") {
    throw new Error("ValorWell calendar token refresh failed (" + response.status + ")");
  }
  return body.access_token as string;
}

async function googleEventStatus(token: string, eventId: string) {
  const url = "https://www.googleapis.com/calendar/v3/calendars/" +
    encodeURIComponent(CALENDAR_ID) + "/events/" + encodeURIComponent(eventId);
  const response = await fetch(url, {
    headers: { authorization: "Bearer " + token },
  });
  if (response.status === 404 || response.status === 410) return "deleted";
  if (!response.ok) throw new Error("Google event lookup failed (" + response.status + ")");
  const event = await response.json().catch(() => ({}));
  if (event.id !== eventId) throw new Error("Google event identity mismatch");
  if (event.status === "cancelled") return "deleted";
  if (event.status === "confirmed" || event.status === "tentative") return "active";
  throw new Error("Unknown Google event status");
}

async function updateRelatedCrm(admin: DbClient, meeting: Meeting, timestamp: string) {
  if (!meeting.opportunity_id) return;
  const { data: otherMeetings, error: otherError } = await admin
    .from("relationship_meetings").select("id")
    .eq("tenant_id", TENANT_ID)
    .eq("organization_id", meeting.organization_id)
    .eq("purpose", meeting.purpose)
    .in("event_status", ACTIVE)
    .limit(1);
  if (otherError) throw new Error("Other meeting check: " + otherError.message);
  if ((otherMeetings ?? []).length) return;

  const { data: opportunity, error: opportunityError } = await admin
    .from("relationship_opportunities")
    .select("id,status,version,next_action,next_action_due_at")
    .eq("tenant_id", TENANT_ID)
    .eq("organization_id", meeting.organization_id)
    .eq("id", meeting.opportunity_id)
    .maybeSingle();
  if (opportunityError) throw new Error("Opportunity read: " + opportunityError.message);
  if (!opportunity) return;

  const dueMatches = opportunity.next_action_due_at &&
    new Date(opportunity.next_action_due_at).getTime() ===
      new Date(meeting.starts_at).getTime();
  const describesMeeting = /BTY|Beyond The Yellow|pre.interview|introductory|recording/i
    .test(opportunity.next_action ?? "");
  const clearAction = Boolean(dueMatches && describesMeeting);
  const expectedStatus = meeting.purpose === "bty_preinterview"
    ? "pre_interview_scheduled" : "booked";
  const rollbackStatus = meeting.purpose === "bty_preinterview"
    ? "interested" : "recording_planned";
  let status = opportunity.status as string;
  if (status === expectedStatus) {
    const { data: history, error: historyError } = await admin
      .from("relationship_opportunity_status_history")
      .select("to_status,from_status")
      .eq("tenant_id", TENANT_ID)
      .eq("opportunity_id", meeting.opportunity_id)
      .order("changed_at", { ascending: false })
      .limit(1);
    if (historyError) throw new Error("Status history read: " + historyError.message);
    const prior = history?.[0];
    const validPrior = prior?.to_status === expectedStatus &&
      prior.from_status &&
      !["completed", "declined", "disqualified", expectedStatus].includes(prior.from_status);
    status = validPrior ? prior.from_status : rollbackStatus;
  }
  if (status !== opportunity.status || clearAction) {
    const patch: Record<string, unknown> = {};
    if (status !== opportunity.status) patch.status = status;
    if (clearAction) {
      patch.next_action = null;
      patch.next_action_due_at = null;
    }
    const { data: updated, error: updateError } = await admin
      .from("relationship_opportunities")
      .update(patch)
      .eq("tenant_id", TENANT_ID)
      .eq("id", opportunity.id)
      .eq("version", opportunity.version)
      .select("id,version,status")
      .maybeSingle();
    if (updateError) throw new Error("Opportunity update: " + updateError.message);
    if (updated && status !== opportunity.status) {
      const { error: auditError } = await admin
        .from("relationship_opportunity_status_history")
        .insert({
          tenant_id: TENANT_ID,
          opportunity_id: updated.id,
          from_status: opportunity.status,
          to_status: updated.status,
          changed_at: timestamp,
          version: updated.version,
          reason: "Google Calendar deletion reconciled; BTY appointment removed from active scheduling.",
          metadata: {
            source: "bty_calendar_delete_reconcile",
            meeting_id: meeting.id,
            calendar_event_id: meeting.external_event_id,
          },
        });
      if (auditError) throw new Error("Status history insert: " + auditError.message);
    }
  }

  // Only clear the organization's scheduling task if it still points at this
  // same appointment; unrelated next actions and other meetings are untouched.
  const { data: org, error: orgError } = await admin
    .from("relationship_organizations")
    .select("id,next_action,next_action_due_at")
    .eq("tenant_id", TENANT_ID)
    .eq("id", meeting.organization_id)
    .maybeSingle();
  if (orgError) throw new Error("Organization read: " + orgError.message);
  if (org?.next_action && org.next_action_due_at &&
      new Date(org.next_action_due_at).getTime() === new Date(meeting.starts_at).getTime() &&
      /BTY|Beyond The Yellow|pre.interview|introductory|recording/i.test(org.next_action)) {
    const { error } = await admin.from("relationship_organizations")
      .update({ next_action: null, next_action_due_at: null })
      .eq("tenant_id", TENANT_ID)
      .eq("id", org.id)
      .eq("next_action", org.next_action)
      .eq("next_action_due_at", org.next_action_due_at);
    if (error) throw new Error("Organization action update: " + error.message);
  }
}

async function cancelMeeting(admin: DbClient, meeting: Meeting) {
  const timestamp = new Date().toISOString();
  const metadata = {
    ...(meeting.metadata ?? {}),
    calendar_deletion_reconciliation: {
      source: "bty_calendar_delete_reconcile",
      reason: "google_event_deleted",
      detected_at: timestamp,
      calendar_id: CALENDAR_ID,
      external_event_id: meeting.external_event_id,
    },
  };
  const { data: updated, error: updateError } = await admin
    .from("relationship_meetings")
    .update({
      event_status: "cancelled",
      last_synced_at: timestamp,
      metadata,
    })
    .eq("tenant_id", TENANT_ID)
    .eq("calendar_id", CALENDAR_ID)
    .eq("id", meeting.id)
    .eq("external_event_id", meeting.external_event_id)
    .eq("starts_at", meeting.starts_at)
    .in("event_status", ACTIVE)
    .select("id")
    .maybeSingle();
  if (updateError) throw new Error("Meeting cancellation: " + updateError.message);
  if (!updated) return false;

  // A cancellation may not mean a guest no-show; do not infer attendance.
  const { error: logError } = await admin
    .from("relationship_interactions")
    .insert({
      tenant_id: TENANT_ID,
      organization_id: meeting.organization_id,
      contact_id: meeting.contact_id,
      opportunity_id: meeting.opportunity_id,
      interaction_type: "system",
      occurred_at: timestamp,
      summary: "Google Calendar BTY appointment was deleted; removed from active CRM scheduling.",
      metadata: {
        source: "bty_calendar_delete_reconcile",
        meeting_id: meeting.id,
        calendar_event_id: meeting.external_event_id,
        meeting_type: meeting.purpose,
        original_start_at: meeting.starts_at,
      },
    });
  if (logError) console.error("BTY deletion interaction audit failed", {
    meetingId: meeting.id, error: logError.message,
  });

  await updateRelatedCrm(admin, meeting, timestamp);
  return true;
}

async function main(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!equalSecret(request.headers.get("x-cron-secret") ?? "",
      Deno.env.get("CRON_SECRET") ?? "")) {
    return json({ error: "Unauthorized" }, 401);
  }
  const input = await request.json().catch(() => ({}));
  const dryRun = input.dryRun === true;
  const admin = adminClient();
  const token = await accessToken(admin);

  // Before interpreting any event 404 as deletion, independently prove that
  // this exact calendar is still accessible with the acquired token.
  const probe = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/" +
      encodeURIComponent(CALENDAR_ID),
    { headers: { authorization: "Bearer " + token } },
  );
  if (!probe.ok) throw new Error("Calendar identity/availability probe failed (" + probe.status + ")");
  const identity = await probe.json().catch(() => ({}));
  if (String(identity.id ?? "").toLowerCase() !== CALENDAR_ID) {
    throw new Error("Calendar identity probe returned the wrong calendar");
  }

  const summary: {
    dryRun: boolean;
    checked: number;
    active: number;
    deleted: number;
    reconciled: number;
    errors: number;
    eventResults: Array<{ meetingId: string; outcome: string; error?: string }>;
  } = { dryRun, checked: 0, active: 0, deleted: 0, reconciled: 0, errors: 0, eventResults: [] };

  // Iterate all linked BTY appointments, including historical and imported
  // ones. Never touch clinical appointments or another calendar.
  let offset = 0;
  while (true) {
    const { data, error } = await admin
      .from("relationship_meetings")
      .select("id,tenant_id,organization_id,contact_id,opportunity_id,purpose,calendar_id,external_event_id,event_status,starts_at,metadata")
      .eq("tenant_id", TENANT_ID)
      .eq("calendar_id", CALENDAR_ID)
      .in("purpose", PURPOSES)
      .in("event_status", ACTIVE)
      .not("external_event_id", "is", null)
      .order("id", { ascending: true })
      .range(offset, offset + 199);
    if (error) throw new Error("BTY meeting read failed: " + error.message);
    const meetings = (data ?? []) as Meeting[];
    for (const meeting of meetings) {
      const eventId = meeting.external_event_id;
      if (!eventId || eventId.startsWith("pending:")) continue;
      summary.checked += 1;
      try {
        const state = await googleEventStatus(token, eventId);
        if (state === "active") {
          summary.active += 1;
        } else {
          summary.deleted += 1;
          if (!dryRun && await cancelMeeting(admin, meeting)) summary.reconciled += 1;
        }
        if (dryRun || state !== "active") {
          summary.eventResults.push({ meetingId: meeting.id, outcome: state });
        }
      } catch (error) {
        summary.errors += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error("BTY deletion check failed", { meetingId: meeting.id, error: message });
        summary.eventResults.push({ meetingId: meeting.id, outcome: "error", error: message });
      }
    }
    if (meetings.length < 200) break;
    offset += 200;
  }
  console.log("BTY calendar delete reconcile", {
    dryRun: summary.dryRun, checked: summary.checked,
    deleted: summary.deleted, reconciled: summary.reconciled,
    errors: summary.errors,
  });
  return json(summary, summary.errors ? 207 : 200);
}

Deno.serve(async (request) => {
  try {
    return await main(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("BTY calendar delete reconcile fatal", { message });
    return json({ error: "BTY calendar reconciliation unavailable" }, 500);
  }
});
