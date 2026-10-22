import "jsr:@supabase/functions-js@2.4.5/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.93.1";
import { DateTime } from "npm:luxon@3.7.2";

// Independent clinician interview capacity; only overlapping BTY events block slots.
const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const OWNER_STAFF_ID = "af790579-5d4c-4aed-9d2e-77d72908ed85";
const ZONE = "America/Chicago";
const BUSINESS = "info@valorwell.org";
const PERSONAL = "predmoreluke@gmail.com";
const BLOCK = "c_f93b9ec3926e3512b6facfd8751ef8976dbbff689e40f4b03ac81179e9c55d2b@group.calendar.google.com";
const OWL = "ba328b6389131c91903939ab58a2c412db6d47bfeee1defabe589afd52cf5d9c@group.calendar.google.com";
const FAMILY = "family04728270701916614416@group.calendar.google.com";
const ACTIVE = ["reserving", "confirmed", "attention"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-supabase-client-platform, x-supabase-client-runtime, x-supabase-client-platform-version, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...cors, "content-type": "application/json", "cache-control": "no-store" },
});
type Applicant = { id: string; email: string; first_name: string | null; last_name: string | null; status: string; closed_at: string | null; converted_staff_id: string | null };
type Booking = { id: string; applicant_id: string; booking_date: string; starts_at: string; ends_at: string; status: string; google_event_id: string | null; google_meet_url: string | null };
type Interval = { start: DateTime; end: DateTime };
type Connection = { id: string; google_account_email: string; calendar_id: string };
type Runtime = { refreshToken: string };
type CalendarEvent = {
  id?: string; iCalUID?: string; status?: string; transparency?: string; eventType?: string;
  start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }>; createRequest?: { status?: { statusCode?: string } } };
};
const errorMessage = (e: unknown) => e instanceof Error ? e.message : String(e);
const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase();
function admin(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Scheduler is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function keySecret() {
  const secret = Deno.env.get("CLINICIAN_SCHEDULER_SIGNING_SECRET")
    || Deno.env.get("BTY_SCHEDULER_SIGNING_SECRET")
    || Deno.env.get("OAUTH_STATE_SIGNING_SECRET");
  if (!secret) throw new Error("Scheduler signing secret is missing.");
  return secret;
}
function b64(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}
function unb64(s: string) {
  const x = atob(s.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(x, c => c.charCodeAt(0));
}
async function hmac() {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(keySecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function issue(applicant: Applicant) {
  const payload = b64(new TextEncoder().encode(JSON.stringify({ applicantId: applicant.id, email: normalize(applicant.email), exp: Math.floor(Date.now()/1000) + 1800, scope: "clinician-interview" })));
  const sig = await crypto.subtle.sign("HMAC", await hmac(), new TextEncoder().encode(payload));
  return payload + "." + b64(new Uint8Array(sig));
}
async function authenticated(db: SupabaseClient, input: Record<string, unknown>): Promise<Applicant> {
  const token = String(input.sessionToken ?? "");
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1] || token.length > 3000) throw new Error("Scheduling session is invalid or expired.");
  let valid = false;
  try {
    valid = await crypto.subtle.verify("HMAC", await hmac(), unb64(parts[1]), new TextEncoder().encode(parts[0]));
  } catch { /* malformed signature */ }
  if (!valid) throw new Error("Scheduling session is invalid or expired.");
  const payload = JSON.parse(new TextDecoder().decode(unb64(parts[0])));
  if (payload.scope !== "clinician-interview" || payload.exp <= Date.now()/1000 || !payload.applicantId) {
    throw new Error("Scheduling session is invalid or expired.");
  }
  const { data, error } = await db.from("provider_applicants")
    .select("id,email,first_name,last_name,status,closed_at,converted_staff_id")
    .eq("tenant_id", TENANT_ID).eq("id", payload.applicantId).maybeSingle();
  if (error || !data || !eligible(data as Applicant) || normalize(data.email) !== payload.email
      || !(await interviewAccess(db, payload.applicantId))) {
    throw new Error("Scheduling invitation is no longer available.");
  }
  return data as Applicant;
}
function eligible(a: Applicant) {
  return Boolean(a.email && !a.closed_at && !a.converted_staff_id && !["declined", "withdrawn", "rejected", "hired"].includes(String(a.status).toLowerCase()));
}
async function interviewAccess(db: SupabaseClient, applicantId: string): Promise<boolean> {
  const { data, error } = await db.rpc("crm_applicant_interview_can_access", { p_applicant_id: applicantId });
  if (error) throw new Error("Scheduling access verification is unavailable.");
  return data === true;
}
const nameOf = (a: Applicant) => [a.first_name, a.last_name].filter(Boolean).join(" ").trim() || "Applicant";
const bookingPublic = (b: Booking | null) => b ? ({
  startUtc: b.starts_at, endUtc: b.ends_at, meetingUrl: b.google_meet_url,
}) : null;
async function activeBooking(db: SupabaseClient, applicantId: string) {
  const { data, error } = await db.from("clinician_interview_bookings")
    .select("id,applicant_id,booking_date,starts_at,ends_at,status,google_event_id,google_meet_url")
    .eq("tenant_id", TENANT_ID).eq("applicant_id", applicantId).in("status", ACTIVE).maybeSingle();
  if (error) throw new Error("Could not check current appointment.");
  return (data as Booking | null);
}
async function listConnections(db: SupabaseClient): Promise<Connection[]> {
  const { data, error } = await db.rpc("list_bty_scheduler_calendar_connections");
  if (error) throw new Error("Calendar availability is unavailable.");
  const connections = (data ?? []) as Connection[];
  if (!connections.some(c => c.google_account_email === BUSINESS) || !connections.some(c => c.google_account_email === PERSONAL)) {
    throw new Error("Calendar availability is unavailable.");
  }
  return connections;
}
async function refreshToken(refresh: string, clientId: string, secret: string) {
  if (!refresh || !clientId || !secret) throw new Error("Calendar authentication is unavailable.");
  const req = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: secret, refresh_token: refresh, grant_type: "refresh_token" }),
  });
  const result = await req.json().catch(() => ({}));
  if (!req.ok || typeof result.access_token !== "string") throw new Error("Calendar authentication is unavailable.");
  return result.access_token as string;
}
async function readToken(db: SupabaseClient, id: string) {
  const { data, error } = await db.rpc("get_relationship_google_connection_runtime", {
    p_tenant_id: TENANT_ID, p_connection_type: "calendar", p_connection_id: id,
  });
  if (error || !data) throw new Error("Calendar availability is unavailable.");
  const runtime = data as Runtime;
  return refreshToken(runtime.refreshToken, Deno.env.get("GOOGLE_RELATIONSHIPS_CLIENT_ID") ?? "", Deno.env.get("GOOGLE_RELATIONSHIPS_CLIENT_SECRET") ?? "");
}
async function googleEvents(token: string, calendar: string, start: string, end: string) {
  const result: CalendarEvent[] = [];
  let page: string | undefined;
  do {
    const params = new URLSearchParams({ timeMin: start, timeMax: end, singleEvents: "true", showDeleted: "false", maxResults: "2500", timeZone: ZONE });
    if (page) params.set("pageToken", page);
    const fetched = await fetch("https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(calendar) + "/events?" + params.toString(), {
      headers: { authorization: "Bearer " + token },
    });
    const data = await fetched.json().catch(() => ({}));
    if (!fetched.ok) throw new Error("Calendar availability is unavailable.");
    result.push(...(Array.isArray(data.items) ? data.items : []));
    page = typeof data.nextPageToken === "string" ? data.nextPageToken : undefined;
  } while (page);
  return result;
}
function bounds(e: CalendarEvent): Interval | null {
  if (e.status === "cancelled" || e.transparency === "transparent" || e.eventType === "birthday" || e.eventType === "workingLocation") return null;
  const start = e.start?.dateTime || e.start?.date;
  const end = e.end?.dateTime || e.end?.date;
  if (!start || !end) return null;
  const a = DateTime.fromISO(start, { zone: e.start?.date ? ZONE : undefined });
  const b = DateTime.fromISO(end, { zone: e.end?.date ? ZONE : undefined });
  return a.isValid && b.isValid && b > a ? { start: a, end: b } : null;
}
async function busy(db: SupabaseClient, rangeStart: DateTime, rangeEnd: DateTime, exceptBookingId?: string): Promise<Interval[]> {
  const from = rangeStart.toUTC().toISO()!;
  const to = rangeEnd.toUTC().toISO()!;
  const [connections, btyResult, ownResult] = await Promise.all([
    listConnections(db),
    db.from("relationship_meetings").select("starts_at,ends_at").eq("tenant_id", TENANT_ID)
      .in("event_status", ["tentative", "confirmed"]).not("starts_at","is",null).not("ends_at","is",null)
      .lt("starts_at", to).gt("ends_at", from),
    db.from("clinician_interview_bookings").select("id,starts_at,ends_at").eq("tenant_id", TENANT_ID)
      .in("status", ACTIVE).lt("starts_at", to).gt("ends_at", from),
  ]);
  if (btyResult.error || ownResult.error) throw new Error("Calendar availability is unavailable.");
  const calendarResults = await Promise.all(connections.flatMap(c => {
    const ids = c.google_account_email === BUSINESS ? [BUSINESS, BLOCK]
      : c.google_account_email === PERSONAL ? [PERSONAL, OWL, FAMILY] : [];
    return ids.map(async calendar => {
      const token = await readToken(db, c.id);
      return googleEvents(token, calendar, from, to);
    });
  }));
  const intervals: Interval[] = [];
  for (const events of calendarResults) for (const e of events) {
    const item = bounds(e);
    if (item) intervals.push(item);
  }
  for (const row of btyResult.data ?? []) {
    const start = DateTime.fromISO(row.starts_at), end = DateTime.fromISO(row.ends_at);
    if (start.isValid && end.isValid) intervals.push({ start, end });
  }
  for (const row of ownResult.data ?? []) {
    if (row.id === exceptBookingId) continue;
    const start = DateTime.fromISO(row.starts_at), end = DateTime.fromISO(row.ends_at);
    if (start.isValid && end.isValid) intervals.push({ start, end });
  }
  return intervals;
}
const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;
const horizonStart = () => DateTime.now().setZone(ZONE).startOf("day");
function allowed(start: DateTime) {
  const now = DateTime.now().setZone(ZONE);
  return start.isValid
    && start.toUTC() >= now.toUTC().plus({ hours: 72 })
    && start >= horizonStart() && start < horizonStart().plus({ weeks: 8 })
    && start.weekday <= 5 && start.hour >= 9 && start.hour <= 13
    && start.minute === 0 && start.second === 0 && start.millisecond === 0;
}
async function dayTaken(db: SupabaseClient, date: string, exceptId?: string) {
  let query = db.from("clinician_interview_bookings").select("id").eq("tenant_id", TENANT_ID)
    .eq("booking_date", date).in("status", ACTIVE).limit(1);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query;
  if (error) throw new Error("Availability check failed.");
  return (data ?? []).length > 0;
}
async function slotAvailable(db: SupabaseClient, start: DateTime, exceptId?: string) {
  if (!allowed(start)) return false;
  const date = start.toFormat("yyyy-MM-dd");
  if (await dayTaken(db, date, exceptId)) return false;
  const end = start.plus({ hours: 1 });
  const intervals = await busy(db, start.startOf("day").minus({ hours: 2 }), start.startOf("day").plus({ days: 1, hours: 2 }), exceptId);
  return !intervals.some(i => overlaps(i, { start, end }));
}
async function availability(db: SupabaseClient) {
  const first = horizonStart();
  const last = first.plus({ weeks: 8 });
  const intervals = await busy(db, first.minus({ hours: 2 }), last.plus({ hours: 2 }));
  const { data, error } = await db.from("clinician_interview_bookings").select("booking_date")
    .eq("tenant_id", TENANT_ID).in("status", ACTIVE)
    .gte("booking_date", first.toISODate()).lt("booking_date", last.toISODate());
  if (error) throw new Error("Availability check failed.");
  const occupied = new Set((data ?? []).map(r => String(r.booking_date)));
  const days: Array<{ date: string; slots: Array<{ startUtc: string; endUtc: string }> }> = [];
  for (let day = first; day < last; day = day.plus({ days: 1 })) {
    if (day.weekday > 5 || occupied.has(day.toFormat("yyyy-MM-dd"))) continue;
    const slots: Array<{ startUtc: string; endUtc: string }> = [];
    for (let hour = 9; hour <= 13; hour++) {
      const start = day.set({ hour, minute: 0, second: 0, millisecond: 0 });
      if (!allowed(start)) continue;
      const end = start.plus({ hours: 1 });
      if (intervals.some(item => overlaps(item, { start, end }))) continue;
      slots.push({ startUtc: start.toUTC().toISO()!, endUtc: end.toUTC().toISO()! });
    }
    if (slots.length) days.push({ date: day.toFormat("yyyy-MM-dd"), slots });
  }
  return { timezone: ZONE, firstBookableDate: first.toISODate(), lastBookableDate: last.minus({ days: 1 }).toISODate(), days };
}
const hex = (s: string) => Uint8Array.from((s.match(/.{2}/g) ?? []), x => parseInt(x, 16));
async function writeAccess(db: SupabaseClient) {
  const { data, error } = await db.from("staff_calendar_connections")
    .select("id,selected_calendar_id,refresh_token_encrypted,connection_status")
    .eq("staff_id", OWNER_STAFF_ID).eq("provider", "google").eq("connection_status", "connected").maybeSingle();
  if (error || !data || data.selected_calendar_id !== BUSINESS || !data.refresh_token_encrypted) {
    throw new Error("Calendar booking is temporarily unavailable.");
  }
  const encryptionKey = Deno.env.get("TOKEN_ENCRYPTION_KEY") ?? "";
  const [iv, cipher] = String(data.refresh_token_encrypted).split(":");
  if (!encryptionKey || !iv || !cipher) throw new Error("Calendar booking is temporarily unavailable.");
  const key = await crypto.subtle.importKey("raw", hex(encryptionKey), { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: hex(iv) }, key, hex(cipher));
  const refresh = new TextDecoder().decode(decrypted);
  const token = await refreshToken(refresh, Deno.env.get("GOOGLE_CLIENT_ID") ?? "", Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "");
  return { token, calendar: BUSINESS };
}
async function googleCreate(write: { token: string; calendar: string }, applicant: Applicant, start: DateTime) {
  const url = "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(write.calendar) + "/events";
  const content = {
    summary: "ValorWell Clinician Interview | " + nameOf(applicant),
    description: "One-hour clinician interview with ValorWell. All times are Central Time.",
    start: { dateTime: start.toISO({ suppressMilliseconds: true }), timeZone: ZONE },
    end: { dateTime: start.plus({ hours: 1 }).toISO({ suppressMilliseconds: true }), timeZone: ZONE },
    attendees: [{ email: normalize(applicant.email) }],
    transparency: "opaque",
    extendedProperties: { private: { source: "clinician_interview_scheduler", applicantId: applicant.id } },
    conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
  };
  const r = await fetch(url + "?sendUpdates=all&conferenceDataVersion=1", {
    method: "POST", headers: { authorization: "Bearer " + write.token, "content-type": "application/json" },
    body: JSON.stringify(content),
  });
  let event = await r.json().catch(() => ({})) as CalendarEvent;
  if (!r.ok || !event.id) throw new Error("Google Calendar could not create the invitation.");
  const linkOf = (e: CalendarEvent) => e.hangoutLink || e.conferenceData?.entryPoints?.find(x => x.entryPointType === "video")?.uri || null;
  let meet = linkOf(event);
  for (let n = 0; !meet && n < 6; n++) {
    await new Promise(resolve => setTimeout(resolve, 350 + 150 * n));
    const check = await fetch(url + "/" + encodeURIComponent(event.id) + "?conferenceDataVersion=1", {
      headers: { authorization: "Bearer " + write.token },
    });
    if (!check.ok) continue;
    event = await check.json() as CalendarEvent;
    meet = linkOf(event);
    if (event.conferenceData?.createRequest?.status?.statusCode === "failure") break;
  }
  if (!meet) {
    await fetch(url + "/" + encodeURIComponent(event.id) + "?sendUpdates=all", {
      method: "DELETE", headers: { authorization: "Bearer " + write.token },
    }).catch(() => undefined);
    throw new Error("Google Meet was not ready; please choose your time again.");
  }
  return { id: event.id, uid: event.iCalUID ?? null, meet };
}
const buckets = new Map<string, { count: number; until: number }>();
function allowedValidate(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now(), old = buckets.get(ip);
  if (!old || old.until < now) { buckets.set(ip, { count: 1, until: now + 600000 }); return true; }
  if (old.count >= 12) return false;
  old.count++; return true;
}
async function validate(db: SupabaseClient, req: Request, input: Record<string, unknown>) {
  if (!allowedValidate(req)) return response({ eligible: false, error: "Too many attempts. Try again later." }, 429);
  const email = normalize(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return response({ eligible: false });
  const { data, error } = await db.from("provider_applicants")
    .select("id,email,first_name,last_name,status,closed_at,converted_staff_id,created_at")
    .eq("tenant_id", TENANT_ID).ilike("email", email).order("created_at", { ascending: false }).limit(10);
  if (error) throw new Error("Invitation lookup is unavailable.");
  const applicant = (data ?? []).find(row => normalize(row.email) === email && eligible(row)) as Applicant | undefined;
  if (!applicant || !(await interviewAccess(db, applicant.id))) return response({ eligible: false });
  const current = await activeBooking(db, applicant.id);
  return response({ eligible: true, name: nameOf(applicant), sessionToken: await issue(applicant), expiresInSeconds: 1800, booking: bookingPublic(current) });
}
async function book(db: SupabaseClient, applicant: Applicant, input: Record<string, unknown>) {
  const requested = DateTime.fromISO(String(input.startUtc ?? ""), { zone: "utc" });
  if (!requested.isValid) return response({ booked: false, error: "Invalid start time." }, 400);
  const start = requested.setZone(ZONE);
  const existing = await activeBooking(db, applicant.id);
  if (existing) return response({ booked: existing.status === "confirmed", alreadyBooked: true, booking: bookingPublic(existing), error: existing.status !== "confirmed" ? "Your appointment is being checked. Please contact ValorWell." : undefined }, existing.status === "confirmed" ? 200 : 409);
  if (!(await slotAvailable(db, start))) {
    return response({ booked: false, code: "slot_unavailable", error: "This time is no longer available. Please pick another." }, 409);
  }
  const { data: held, error: holdError } = await db.from("clinician_interview_bookings").insert({
    tenant_id: TENANT_ID, applicant_id: applicant.id, booking_date: start.toFormat("yyyy-MM-dd"),
    starts_at: start.toUTC().toISO(), ends_at: start.plus({ hours: 1 }).toUTC().toISO(),
    status: "reserving",
  }).select("id").single();
  if (holdError) {
    if (holdError.code === "23505") return response({ booked: false, code: "slot_unavailable", error: "That day was just booked. Please choose another." }, 409);
    throw new Error("Unable to reserve appointment.");
  }
  let googleCreated: { id: string; uid: string | null; meet: string } | null = null;
  try {
    if (!(await slotAvailable(db, start, held.id))) {
      await db.from("clinician_interview_bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", held.id);
      return response({ booked: false, code: "slot_unavailable", error: "That time has just become unavailable. Please choose another." }, 409);
    }
    const write = await writeAccess(db);
    googleCreated = await googleCreate(write, applicant, start);
    const { error: confirmationError } = await db.from("clinician_interview_bookings").update({
      status: "confirmed", google_event_id: googleCreated.id, google_ical_uid: googleCreated.uid,
      google_meet_url: googleCreated.meet, updated_at: new Date().toISOString(),
    }).eq("id", held.id).eq("status", "reserving");
    if (confirmationError) {
      await db.from("clinician_interview_bookings").update({
        status: "attention", google_event_id: googleCreated.id, google_ical_uid: googleCreated.uid,
        google_meet_url: googleCreated.me, updated_at: new Date().toISOString(),
      }).eq("id", held.id);
      return response({ booked: true, booking: { startUtc: start.toUTC().toISO(), endUtc: start.plus({ hours: 1 }).toUTC().toISO(), meetingUrl: googleCreated.meet }, reconciliationPending: true });
    }
    // Only a successful Google event and DB confirmation may advance the application workflow.
    const { error: crmError } = await db.from("provider_applicants").update({
      next_action: "Attend scheduled one-hour ValorWell clinician interview",
      next_action_due_at: start.toUTC().toISO(),
      last_activity_at: new Date().toISOString(),
    }).eq("tenant_id", TENANT_ID).eq("id", applicant.id);
    if (crmError) console.error("clinician scheduler CRM follow-up could not be set", crmError.code);
    return response({ booked: true, booking: { startUtc: start.toUTC().toISO(), endUtc: start.plus({ hours: 1 }).toUTC().toISO(), meetingUrl: googleCreated.meet } });
  } catch (e) {
    if (!googleCreated) {
      await db.from("clinician_interview_bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", held.id);
    } else {
      await db.from("clinician_interview_bookings").update({ status: "attention", google_event_id: googleCreated.id, google_ical_uid: googleCreated.uid, google_meet_url: googleCreated.meet }).eq("id", held.id);
    }
    throw e;
  }
}
async function cancel(db: SupabaseClient, applicant: Applicant) {
  const current = await activeBooking(db, applicant.id);
  if (!current || current.status !== "confirmed" || !current.google_event_id) {
    return response({ cancelled: false, error: "This appointment cannot be cancelled online. Please contact info@valorwell.org." }, 409);
  }
  if (DateTime.fromISO(current.starts_at) <= DateTime.now()) {
    return response({ cancelled: false, error: "This interview has already started or passed. Please contact info@valorwell.org." }, 409);
  }
  const write = await writeAccess(db);
  const result = await fetch("https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(write.calendar)
    + "/events/" + encodeURIComponent(current.google_event_id) + "?sendUpdates=all", {
    method: "DELETE", headers: { authorization: "Bearer " + write.token },
  });
  if (!result.ok && result.status !== 404 && result.status !== 410) {
    throw new Error("Google Calendar could not cancel this appointment.");
  }
  const { error } = await db.from("clinician_interview_bookings").update({
    status: "cancelled", updated_at: new Date().toISOString(),
  }).eq("id", current.id).eq("status", "confirmed");
  if (error) {
    await db.from("clinician_interview_bookings").update({ status: "attention" }).eq("id", current.id);
    throw new Error("Calendar cancellation succeeded, but the CRM needs review. Please contact info@valorwell.org.");
  }
  await db.from("provider_applicants").update({
    next_action: "Contact applicant to reschedule clinician interview",
    next_action_due_at: null, last_activity_at: new Date().toISOString(),
  }).eq("tenant_id", TENANT_ID).eq("id", applicant.id);
  return response({ cancelled: true });
}
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return response({ error: "Method not allowed." }, 405);
  try {
    const input = await req.json().catch(() => ({})) as Record<string, unknown>;
    const db = admin();
    const action = String(input.action ?? "");
    if (action === "validate") return await validate(db, req, input);
    const applicant = await authenticated(db, input);
    if (action === "availability") {
      const current = await activeBooking(db, applicant.id);
      return current ? response({ state: "booked", booking: bookingPublic(current) }) : response({ state: "ready", ...(await availability(db)) });
    }
    if (action === "book") return await book(db, applicant, input);
    if (action === "cancel") return await cancel(db, applicant);
    return response({ error: "Unknown action." }, 400);
  } catch (e) {
    const message = errorMessage(e);
    console.error("clinician-interview-scheduler", message);
    const status = /session|invitation/i.test(message) ? 401 : 500;
    return response({ error: status === 500 ? "Scheduling is temporarily unavailable. Please email info@valorwell.org." : message }, status);
  }
});
