import "jsr:@supabase/functions-js@2.4.5/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.93.1";
import { DateTime } from "npm:luxon@3.7.2";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const CENTRAL_ZONE = "America/Chicago";
const STREAMYARD_URL = "https://streamyard.com/frr4zf8e3s";
const INFO_CALENDAR = "info@valorwell.org";
const PERSONAL_CALENDAR = "predmoreluke@gmail.com";
const PERSONAL_BLOCK_CALENDAR =
  "c_f93b9ec3926e3512b6facfd8751ef8976dbbff689e40f4b03ac81179e9c55d2b@group.calendar.google.com";
const OWL_CALENDAR =
  "ba328b6389131c91903939ab58a2c412db6d47bfeee1defabe589afd52cf5d9c@group.calendar.google.com";
const FAMILY_CALENDAR =
  "family04728270701916614416@group.calendar.google.com";
const BTY_STAFF_ID = "af790579-5d4c-4aed-9d2e-77d72908ed85";
type MeetingType = "pre_interview" | "bty_interview";

const MEETING_CONFIG = {
  pre_interview: {
    purpose: "bty_preinterview",
    durationMinutes: 30,
    postBufferMinutes: 30,
    slotStepMinutes: 30,
  },
  bty_interview: {
    purpose: "bty_recording",
    durationMinutes: 60,
    postBufferMinutes: 60,
    slotStepMinutes: 60,
  },
} as const;

const DAY_START_MINUTES = 9 * 60;
const DAY_END_MINUTES = 14 * 60;
const SESSION_TTL_SECONDS = 30 * 60;
const AVAILABILITY_WEEKS = 8;
const VALIDATE_LIMIT = 12;
const VALIDATE_WINDOW_MS = 10 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

type SessionPayload = {
  contactId: string;
  organizationId: string;
  opportunityId: string | null;
  email: string;
  exp: number;
};

type RelationshipCalendarConnection = {
  id: string;
  google_account_email: string;
  calendar_id: string;
};

type RelationshipCalendarRuntime = {
  id: string;
  tenantId: string;
  connectionType: "calendar";
  googleAccountEmail: string;
  calendarId: string;
  scopes: string[];
  refreshToken: string;
};

type CalendarEvent = {
  id?: string;
  iCalUID?: string;
  updated?: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  transparency?: string;
  eventType?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{
    email?: string;
    organizer?: boolean;
    self?: boolean;
    resource?: boolean;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  conferenceData?: {
    createRequest?: {
      status?: { statusCode?: string };
    };
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
  extendedProperties?: {
    private?: Record<string, string>;
  };
};

type BusyEvent = {
  start: DateTime;
  end: DateTime;
  allDay: boolean;
  physical: boolean;
  isBtyRecording: boolean;
  isPreInterview: boolean;
  source: "google" | "database";
  sourceId?: string | null;
  iCalUid?: string | null;
};

/**
 * Identifies the guest's OWN booking so a reschedule preview/move does not
 * collide with itself. Matching is by DB row id, exact Google event id, or
 * iCalUID only (the iCalUID also covers the attendee copy on the owner's
 * personal calendar). Never by attendee email or title.
 */
type BookingExclusion = {
  meetingId?: string | null;
  googleEventId?: string | null;
  iCalUid?: string | null;
};

function isExcludedGoogleEvent(event: CalendarEvent, exclusion?: BookingExclusion) {
  if (!exclusion) return false;
  if (exclusion.googleEventId && event.id === exclusion.googleEventId) return true;
  if (exclusion.iCalUid && event.iCalUID === exclusion.iCalUid) return true;
  return false;
}

type ContactRecord = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
};

type OrganizationRecord = {
  id: string;
  name: string;
  veteran_affiliated: boolean | null;
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

type OpportunityRecord = {
  id: string;
  organization_id: string;
  primary_contact_id?: string | null;
  status?: string;
  version?: number;
  qualification: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

const validateBuckets = new Map<string, { count: number; resetAt: number }>();

type AccessTokenCacheEntry = {
  token: string;
  expiresAt: number;
};

const relationshipTokenCache = new Map<string, AccessTokenCacheEntry>();
let relationshipConnectionsCache:
  | { connections: RelationshipCalendarConnection[]; expiresAt: number }
  | null = null;
let writeTokenCache:
  | { connectionId: string; token: string; calendarId: string; expiresAt: number }
  | null = null;


function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceRole) throw new Error("Scheduler runtime is not configured.");
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function parseMeetingType(value: unknown): MeetingType | null {
  return value === "pre_interview" || value === "bty_interview"
    ? value
    : null;
}

type SchedulerTrackingEvent =
  | "page_opened" | "invitation_verified" | "invitation_rejected"
  | "availability_viewed" | "slot_selected" | "booking_submitted"
  | "booking_confirmed" | "booking_failed" | "booking_client_error"
  | "booking_crm_sync_warning" | "booking_released" | "booking_release_failed"
  | "booking_rescheduled" | "booking_reschedule_failed";

const TRACKING_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function trackingId(value: unknown): string | null {
  return typeof value === "string" && TRACKING_ID_PATTERN.test(value)
    ? value : null;
}

type TrackingDetails = {
  eventType: SchedulerTrackingEvent;
  sessionId: string | null;
  attemptId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
  opportunityId?: string | null;
  meetingType?: MeetingType | null;
  startUtc?: string | null;
  failureStage?: string | null;
  failureCode?: string | null;
  httpStatus?: number | null;
  calendarEventId?: string | null;
};

async function recordSchedulerEvent(
  admin: SupabaseClient,
  details: TrackingDetails,
): Promise<void> {
  if (!details.sessionId) return;
  const { error } = await admin.from("bty_scheduler_activity_events").insert({
    tenant_id: TENANT_ID,
    visitor_session_id: details.sessionId,
    booking_attempt_id: details.attemptId ?? null,
    event_type: details.eventType,
    contact_id: details.contactId ?? null,
    organization_id: details.organizationId ?? null,
    opportunity_id: details.opportunityId ?? null,
    meeting_type: details.meetingType ?? null,
    requested_start_utc: details.startUtc ?? null,
    failure_stage: details.failureStage ?? null,
    failure_code: details.failureCode ?? null,
    http_status: details.httpStatus ?? null,
    calendar_event_id: details.calendarEventId ?? null,
  });
  if (error) {
    // Telemetry must never stop the visitor from making a booking.
    console.error("BTY scheduler tracking write failed", {
      eventType: details.eventType, code: error.code,
    });
  }
}

function trackingContext(
  input: Record<string, unknown>,
  session: SessionPayload,
  eventType: SchedulerTrackingEvent,
  more: Partial<TrackingDetails> = {},
): TrackingDetails {
  return {
    eventType,
    sessionId: trackingId(input.visitorSessionId),
    attemptId: trackingId(input.bookingAttemptId),
    contactId: session.contactId,
    organizationId: session.organizationId,
    opportunityId: session.opportunityId,
    ...more,
  };
}

async function handleTrack(
  request: Request,
  admin: SupabaseClient,
  input: Record<string, unknown>,
) {
  const sessionId = trackingId(input.visitorSessionId);
  if (!sessionId) return json({ ok: false }, 400);
  const eventType = input.eventType;
  if (eventType === "page_opened") {
    // Reuse the existing per-request throttle; anonymous events carry no PII.
    if (!checkValidateRateLimit(request)) return json({ ok: false }, 429);
    await recordSchedulerEvent(admin, { eventType: "page_opened", sessionId });
    return json({ ok: true });
  }
  if (eventType !== "slot_selected" && eventType !== "booking_client_error") {
    return json({ ok: false }, 400);
  }
  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  const meetingType = parseMeetingType(input.meetingType);
  const parsedStart = DateTime.fromISO(String(input.startUtc ?? ""), { zone: "utc" });
  if (!meetingType || !parsedStart.isValid) return json({ ok: false }, 400);
  await recordSchedulerEvent(
    admin,
    trackingContext(input, session, eventType, {
      organizationId: context.organization.id,
      contactId: context.contact.id,
      opportunityId: context.opportunity?.id ?? null,
      meetingType,
      startUtc: parsedStart.toUTC().toISO(),
      failureStage: eventType === "booking_client_error" ? "client_request" : null,
      failureCode: eventType === "booking_client_error" ? "network_or_http_error" : null,
    }),
  );
  return json({ ok: true });
}

function meetingPurpose(meetingType: MeetingType) {
  return MEETING_CONFIG[meetingType].purpose;
}

function meetingForType(
  context: {
    bookings: {
      preInterview: Record<string, unknown> | null;
      btyInterview: Record<string, unknown> | null;
    };
  },
  meetingType: MeetingType,
) {
  return meetingType === "pre_interview"
    ? context.bookings.preInterview
    : context.bookings.btyInterview;
}

function meetingUrlFromCalendarEvent(event: CalendarEvent) {
  if (typeof event.hangoutLink === "string" && event.hangoutLink) {
    return event.hangoutLink;
  }
  return (
    event.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video" && entry.uri,
    )?.uri ?? null
  );
}

function serializeBooking(
  meeting: {
    starts_at?: string | null;
    ends_at?: string | null;
    streamyard_url?: string | null;
    meeting_url?: string | null;
    metadata?: Record<string, unknown> | null;
    external_event_id?: string | null;
    id?: string | null;
  } | null,
  meetingType: MeetingType,
) {
  if (!meeting) return null;
  const startsAt = DateTime.fromISO(String(meeting.starts_at ?? ""), { zone: "utc" });
  const canChange =
    Boolean(meeting.id) &&
    meeting.metadata?.source === "bty_public_scheduler" &&
    startsAt.isValid &&
    startsAt > DateTime.utc();
  const metadataMeetUrl =
    typeof meeting.metadata?.google_meet_url === "string"
      ? meeting.metadata.google_meet_url
      : null;
  const meetingUrl =
    meetingType === "bty_interview"
      ? meeting.streamyard_url ?? STREAMYARD_URL
      : meeting.meeting_url ?? metadataMeetUrl;
  return {
    meetingType,
    startUtc: meeting.starts_at,
    endUtc: meeting.ends_at,
    meetingUrl,
    streamyardUrl:
      meetingType === "bty_interview"
        ? meeting.streamyard_url ?? STREAMYARD_URL
        : null,
    calendarEventId: meeting.external_event_id ?? null,
    canChange,
  };
}

function displayName(contact: ContactRecord) {
  return (
    contact.preferred_name?.trim() ||
    [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim() ||
    contact.email ||
    "Guest"
  );
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function schedulerSecret() {
  const secret =
    Deno.env.get("BTY_SCHEDULER_SIGNING_SECRET") ||
    Deno.env.get("OAUTH_STATE_SIGNING_SECRET") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    "";
  if (!secret) throw new Error("Scheduler signing secret is not configured.");
  return secret;
}

async function signingKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(schedulerSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function issueSession(payload: Omit<SessionPayload, "exp">) {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(full)),
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      await signingKey(),
      new TextEncoder().encode(encoded),
    ),
  );
  return `${encoded}.${bytesToBase64Url(signature)}`;
}

async function verifySession(token: unknown): Promise<SessionPayload> {
  const raw = String(token ?? "");
  const [payloadPart, signaturePart] = raw.split(".");
  if (!payloadPart || !signaturePart) throw new Error("Scheduling session is invalid.");
  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(),
    base64UrlToBytes(signaturePart),
    new TextEncoder().encode(payloadPart),
  );
  if (!valid) throw new Error("Scheduling session is invalid.");
  const payload = JSON.parse(
    new TextDecoder().decode(base64UrlToBytes(payloadPart)),
  ) as SessionPayload;
  if (
    !payload.contactId ||
    !payload.organizationId ||
    !payload.email ||
    !payload.exp ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Scheduling session has expired.");
  }
  return payload;
}

function checkValidateRateLimit(request: Request) {
  const key =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const now = Date.now();
  const current = validateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    validateBuckets.set(key, { count: 1, resetAt: now + VALIDATE_WINDOW_MS });
    return true;
  }
  if (current.count >= VALIDATE_LIMIT) return false;
  current.count += 1;
  return true;
}

function isBtyOpportunity(opportunity: OpportunityRecord) {
  const metadata = opportunity.metadata ?? {};
  const qualification = opportunity.qualification ?? {};
  return (
    metadata.initiative === "Beyond The Yellow" ||
    qualification.initiative === "Beyond The Yellow"
  );
}

function isEligibleBtyOrganization(organization: OrganizationRecord) {
  const metadata = organization.metadata ?? {};
  const eligibility = metadata.bty_eligibility as Record<string, unknown> | undefined;
  if (organization.veteran_affiliated !== true || eligibility?.exclude_from_bty === true) {
    return false;
  }
  return (
    metadata.btyNominationOutreachSent === true ||
    String(metadata.btyNominationOutreachSent ?? "").toLowerCase() === "true" ||
    metadata.btySchedulerEnabled === true
  );
}

function organizationPriority(organization: OrganizationRecord) {
  const raw =
    organization.metadata?.btyNominationOutreachLastSentAt ??
    organization.updated_at;
  const timestamp = Date.parse(String(raw ?? ""));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

async function resolveContactContext(admin: SupabaseClient, email: string) {
  const { data: contacts, error: contactError } = await admin
    .from("relationship_contacts")
    .select("id,email,first_name,last_name,preferred_name")
    .eq("tenant_id", TENANT_ID)
    .eq("email", email)
    .limit(2);
  if (contactError) throw new Error(contactError.message);
  const contact = (contacts ?? [])[0] as ContactRecord | undefined;
  if (!contact) return null;

  const { data: links, error: linkError } = await admin
    .from("relationship_contact_organizations")
    .select("organization_id")
    .eq("tenant_id", TENANT_ID)
    .eq("contact_id", contact.id);
  if (linkError) throw new Error(linkError.message);
  const organizationIds = [
    ...new Set((links ?? []).map((row) => String(row.organization_id))),
  ];
  if (!organizationIds.length) return null;

  const { data: organizations, error: organizationError } = await admin
    .from("relationship_organizations")
    .select("id,name,veteran_affiliated,metadata,updated_at")
    .eq("tenant_id", TENANT_ID)
    .in("id", organizationIds);
  if (organizationError) throw new Error(organizationError.message);

  const eligibleOrganizations = ((organizations ?? []) as OrganizationRecord[])
    .filter(isEligibleBtyOrganization)
    .sort((a, b) => organizationPriority(b) - organizationPriority(a));
  if (!eligibleOrganizations.length) return null;

  const eligibleOrganizationIds = eligibleOrganizations.map((row) => row.id);
  const { data: activeMeetings, error: meetingError } = await admin
    .from("relationship_meetings")
    .select(
      "id,purpose,opportunity_id,organization_id,contact_id,starts_at,ends_at,event_status,streamyard_url,external_event_id,ical_uid,decline_detected_at,metadata",
    )
    .eq("tenant_id", TENANT_ID)
    .in("purpose", ["bty_recording", "bty_preinterview"])
    .in("organization_id", eligibleOrganizationIds)
    .in("event_status", ["tentative", "confirmed"])
    .order("starts_at", { ascending: true });
  if (meetingError) throw new Error(meetingError.message);

  const organization =
    eligibleOrganizations.find((row) =>
      (activeMeetings ?? []).some(
        (meeting) => meeting.organization_id === row.id,
      )
    ) ?? eligibleOrganizations[0];

  const organizationMeetings = (activeMeetings ?? []).filter(
    (meeting) => meeting.organization_id === organization.id,
  );
  let btyInterview =
    organizationMeetings.find(
      (meeting) => meeting.purpose === "bty_recording",
    ) ?? null;
  let preInterview =
    organizationMeetings.find(
      (meeting) => meeting.purpose === "bty_preinterview",
    ) ?? null;

  if (!btyInterview || !preInterview) {
    const calendarBookings = await findExistingCalendarBookings(
      admin,
      organization,
      email,
    );
    if (!btyInterview) btyInterview = calendarBookings.btyInterview;
    if (!preInterview) preInterview = calendarBookings.preInterview;
  }

  const { data: opportunities, error: opportunityError } = await admin
    .from("relationship_opportunities")
    .select("id,organization_id,primary_contact_id,status,version,qualification,metadata,updated_at")
    .eq("tenant_id", TENANT_ID)
    .eq("organization_id", organization.id)
    .order("updated_at", { ascending: false });
  if (opportunityError) throw new Error(opportunityError.message);
  const organizationOpportunities = (opportunities ?? []) as OpportunityRecord[];
  // Historic BTY opportunities generally predate the initiative metadata flag.
  // An invitation is already validated above. For organizations with exactly
  // one opportunity, linking that existing record is safer than writing an
  // orphaned meeting. For multiple opportunities, require explicit BTY evidence.
  const opportunity =
    organizationOpportunities.find(isBtyOpportunity) ??
    (organizationOpportunities.length === 1 ? organizationOpportunities[0] : null);

  return {
    contact,
    organization,
    opportunity,
    bookings: {
      preInterview,
      btyInterview,
    },
  };
}

async function revalidateSession(
  admin: SupabaseClient,
  session: SessionPayload,
) {
  const context = await resolveContactContext(admin, session.email);
  if (!context) throw new Error("This scheduling invitation is no longer active.");
  if (
    context.contact.id !== session.contactId ||
    context.organization.id !== session.organizationId
  ) {
    throw new Error("This scheduling invitation is no longer active.");
  }
  return context;
}

async function relationshipCalendarConnections(admin: SupabaseClient) {
  const now = Date.now();
  if (
    relationshipConnectionsCache &&
    relationshipConnectionsCache.expiresAt > now
  ) {
    return relationshipConnectionsCache.connections;
  }

  const { data, error } = await admin.rpc(
    "list_bty_scheduler_calendar_connections",
  );
  if (error) throw new Error(error.message);
  const connections = (data ?? []) as RelationshipCalendarConnection[];
  const required = new Set([INFO_CALENDAR, PERSONAL_CALENDAR]);
  for (const email of required) {
    if (!connections.some((row) => row.google_account_email === email)) {
      throw new Error("Calendar availability is temporarily unavailable.");
    }
  }

  relationshipConnectionsCache = {
    connections,
    expiresAt: now + 30_000,
  };
  return connections;
}

async function relationshipAccessToken(
  admin: SupabaseClient,
  connectionId: string,
) {
  const cached = relationshipTokenCache.get(connectionId);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const { data, error } = await admin.rpc(
    "get_relationship_google_connection_runtime",
    {
      p_tenant_id: TENANT_ID,
      p_connection_type: "calendar",
      p_connection_id: connectionId,
    },
  );
  if (error || !data) throw new Error("Calendar availability is temporarily unavailable.");
  const runtime = data as RelationshipCalendarRuntime;
  const clientId = Deno.env.get("GOOGLE_RELATIONSHIPS_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("GOOGLE_RELATIONSHIPS_CLIENT_SECRET") ?? "";
  if (!clientId || !clientSecret || !runtime.refreshToken) {
    throw new Error("Calendar availability is temporarily unavailable.");
  }

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
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || typeof body.access_token !== "string") {
    relationshipTokenCache.delete(connectionId);
    throw new Error("Calendar availability is temporarily unavailable.");
  }

  const expiresInSeconds =
    typeof body.expires_in === "number" && Number.isFinite(body.expires_in)
      ? body.expires_in
      : 3600;
  const entry = {
    token: body.access_token,
    expiresAt: Date.now() + Math.max(60, expiresInSeconds - 60) * 1000,
  };
  relationshipTokenCache.set(connectionId, entry);
  return entry.token;
}

function calendarsForAccount(email: string) {
  if (email === INFO_CALENDAR) {
    return [INFO_CALENDAR, PERSONAL_BLOCK_CALENDAR];
  }
  if (email === PERSONAL_CALENDAR) {
    return [PERSONAL_CALENDAR, OWL_CALENDAR, FAMILY_CALENDAR];
  }
  return [];
}

async function googleEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
) {
  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      maxResults: "2500",
      timeZone: CENTRAL_ZONE,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { authorization: `Bearer ${accessToken}` } },
    );
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      console.error("BTY scheduler calendar read failed", {
        calendarId,
        status: response.status,
        body,
      });
      throw new Error("Calendar availability is temporarily unavailable.");
    }
    events.push(...(((body.items ?? []) as CalendarEvent[])));
    pageToken =
      typeof body.nextPageToken === "string" ? body.nextPageToken : undefined;
  } while (pageToken);
  return events;
}

function isVirtualLocation(location: string) {
  return /(https?:\/\/|meet\.google|zoom\.us|streamyard|teams\.microsoft|webex|phone|telephone|virtual|online)/i.test(
    location,
  );
}

function eventBounds(event: CalendarEvent) {
  if (event.start?.dateTime && event.end?.dateTime) {
    const start = DateTime.fromISO(event.start.dateTime);
    const end = DateTime.fromISO(event.end.dateTime);
    if (!start.isValid || !end.isValid) return null;
    return {
      start,
      end,
      allDay: false,
    };
  }
  if (event.start?.date && event.end?.date) {
    const start = DateTime.fromISO(event.start.date, { zone: CENTRAL_ZONE }).startOf(
      "day",
    );
    const end = DateTime.fromISO(event.end.date, { zone: CENTRAL_ZONE }).startOf(
      "day",
    );
    if (!start.isValid || !end.isValid) return null;
    return { start, end, allDay: true };
  }
  return null;
}

function normalizeCalendarEvent(event: CalendarEvent): BusyEvent | null {
  if (event.status === "cancelled" || event.transparency === "transparent") {
    return null;
  }
  if (event.eventType === "birthday" || event.eventType === "workingLocation") {
    return null;
  }
  const bounds = eventBounds(event);
  if (!bounds) return null;
  const location = String(event.location ?? "").trim();
  const summary = String(event.summary ?? "");
  const serialized = `${summary} ${event.description ?? ""} ${location}`;
  const privateProps = event.extendedProperties?.private ?? {};
  const isPreInterview =
    privateProps.meetingType === "pre_interview" ||
    /beyond\s+the\s+yellow\s+pre[- ]interview/i.test(summary);
  const isBtyRecording =
    !isPreInterview &&
    (
      privateProps.meetingType === "bty_interview" ||
      serialized.includes(STREAMYARD_URL) ||
      /beyond\s+the\s+yellow/i.test(summary)
    );

  return {
    ...bounds,
    physical: Boolean(location) && !isVirtualLocation(location),
    isBtyRecording,
    isPreInterview,
    source: "google",
    sourceId: event.id ?? null,
    iCalUid: event.iCalUID ?? null,
  };
}

function comparableText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function findExistingCalendarBookings(
  admin: SupabaseClient,
  organization: OrganizationRecord,
  contactEmail: string,
) {
  const connections = await relationshipCalendarConnections(admin);
  const infoConnection = connections.find(
    (row) => row.google_account_email === INFO_CALENDAR,
  );
  if (!infoConnection) {
    throw new Error("Calendar availability is temporarily unavailable.");
  }

  const accessToken = await relationshipAccessToken(admin, infoConnection.id);
  const now = DateTime.now().setZone(CENTRAL_ZONE);
  const events = await googleEvents(
    accessToken,
    INFO_CALENDAR,
    now.minus({ days: 1 }).toUTC().toISO()!,
    now.plus({ days: 365 }).toUTC().toISO()!,
  );
  const organizationNeedle = comparableText(organization.name);
  const normalizedEmail = normalizeEmail(contactEmail);
  let preInterview: Record<string, unknown> | null = null;
  let btyInterview: Record<string, unknown> | null = null;

  for (const event of events) {
    const normalized = normalizeCalendarEvent(event);
    if (!normalized || normalized.end < now) continue;

    const attendeeEmails = (event.attendees ?? [])
      .map((attendee) => normalizeEmail(attendee.email))
      .filter(Boolean);
    const summary = comparableText(event.summary);
    const matchesEmail = attendeeEmails.includes(normalizedEmail);
    const matchesOrganization =
      organizationNeedle.length >= 4 && summary.includes(organizationNeedle);
    if (!matchesEmail && !matchesOrganization) continue;

    const meetingType: MeetingType | null = normalized.isPreInterview
      ? "pre_interview"
      : normalized.isBtyRecording
        ? "bty_interview"
        : null;
    if (!meetingType) continue;

    const booking = {
      id: null,
      purpose: meetingPurpose(meetingType),
      opportunity_id: null,
      organization_id: organization.id,
      contact_id: null,
      starts_at: normalized.start.toUTC().toISO(),
      ends_at: normalized.end.toUTC().toISO(),
      event_status: "confirmed",
      streamyard_url:
        meetingType === "bty_interview" ? STREAMYARD_URL : null,
      meeting_url:
        meetingType === "pre_interview"
          ? meetingUrlFromCalendarEvent(event)
          : STREAMYARD_URL,
      external_event_id: event.id ?? null,
      ical_uid: event.iCalUID ?? null,
      metadata: {},
    };

    if (meetingType === "pre_interview" && !preInterview) {
      preInterview = booking;
    } else if (meetingType === "bty_interview" && !btyInterview) {
      btyInterview = booking;
    }

    if (preInterview && btyInterview) break;
  }

  return { preInterview, btyInterview };
}

async function collectBusyEvents(
  admin: SupabaseClient,
  rangeStart: DateTime,
  rangeEnd: DateTime,
  exclusion?: BookingExclusion,
) {
  const connections = await relationshipCalendarConnections(admin);
  const timeMin = rangeStart.toUTC().toISO()!;
  const timeMax = rangeEnd.toUTC().toISO()!;

  const calendarReadsPromise = Promise.all(
    connections.map(async (connection) => ({
      connection,
      accessToken: await relationshipAccessToken(admin, connection.id),
    })),
  ).then((authorizedConnections) =>
    Promise.all(
      authorizedConnections.flatMap(({ connection, accessToken }) =>
        calendarsForAccount(connection.google_account_email).map(
          async (calendarId) => ({
            calendarId,
            events: await googleEvents(
              accessToken,
              calendarId,
              timeMin,
              timeMax,
            ),
          }),
        ),
      ),
    ),
  );

  const meetingsPromise = (async () => {
    let meetingsQuery = admin
      .from("relationship_meetings")
      .select("id,purpose,starts_at,ends_at,external_event_id,ical_uid")
      .eq("tenant_id", TENANT_ID)
      .in("purpose", ["bty_recording", "bty_preinterview"])
      .in("event_status", ["tentative", "confirmed"])
      .not("starts_at", "is", null)
      .not("ends_at", "is", null)
      .lt("starts_at", timeMax)
      .gt("ends_at", timeMin);
    if (exclusion?.meetingId) {
      meetingsQuery = meetingsQuery.neq("id", exclusion.meetingId);
    }
    const { data, error } = await meetingsQuery;
    if (error) throw new Error(error.message);
    return data ?? [];
  })();

  const clinicianReservationsPromise = admin.from("clinician_interview_bookings")
    .select("starts_at,ends_at")
    .eq("tenant_id", TENANT_ID)
    .in("status", ["reserving", "confirmed", "attention"])
    .lt("starts_at", timeMax)
    .gt("ends_at", timeMin);

  const [calendarReads, meetings, clinicianReservations] = await Promise.all([
    calendarReadsPromise,
    meetingsPromise,
    clinicianReservationsPromise,
  ]);
  if (clinicianReservations.error) {
    throw new Error("Calendar availability is temporarily unavailable.");
  }

  const busy: BusyEvent[] = [];
  for (const { events } of calendarReads) {
    for (const event of events) {
      // Suppress the guest's own event on every checked calendar.
      if (isExcludedGoogleEvent(event, exclusion)) continue;
      const normalized = normalizeCalendarEvent(event);
      if (normalized) busy.push(normalized);
    }
  }

  for (const meeting of meetings) {
    const start = DateTime.fromISO(String(meeting.starts_at));
    const end = DateTime.fromISO(String(meeting.ends_at));
    if (!start.isValid || !end.isValid) continue;
    busy.push({
      start,
      end,
      allDay: false,
      physical: false,
      isBtyRecording: meeting.purpose === "bty_recording",
      isPreInterview: meeting.purpose === "bty_preinterview",
      source: "database",
      sourceId: meeting.external_event_id ?? meeting.id,
    });
  }

  // Pending clinician reservations must also block BTY *overlaps*.
  // They do not count toward the separate BTY per-day interview quota.
  for (const appointment of clinicianReservations.data ?? []) {
    const start = DateTime.fromISO(String(appointment.starts_at));
    const end = DateTime.fromISO(String(appointment.ends_at));
    if (!start.isValid || !end.isValid) continue;
    busy.push({
      start, end, allDay: false, physical: false,
      isBtyRecording: false, isPreInterview: false,
      source: "database",
    });
  }

  return busy;
}

function firstBookableMonday(now = DateTime.now().setZone(CENTRAL_ZONE)) {
  const threshold = now.startOf("day").plus({ days: 7 });
  return threshold.weekday === 1
    ? threshold
    : threshold.plus({ days: 8 - threshold.weekday }).startOf("day");
}

function btyInterviewSlotConflicts(
  slotStart: DateTime,
  slotEnd: DateTime,
  event: BusyEvent,
) {
  const bufferHours = event.physical ? 2 : 1;
  const blockedStart = event.start.minus({ hours: bufferHours });
  const blockedEnd = event.end.plus({ hours: bufferHours });
  return slotStart < blockedEnd && slotEnd > blockedStart;
}

function preInterviewSlotConflicts(
  slotStart: DateTime,
  slotEnd: DateTime,
  event: BusyEvent,
) {
  const candidateEnd = slotEnd.plus({
    minutes: MEETING_CONFIG.pre_interview.postBufferMinutes,
  });

  let blockedStart = event.start;
  let blockedEnd = event.end;

  if (event.isBtyRecording) {
    blockedStart = event.start.minus({
      minutes: MEETING_CONFIG.bty_interview.postBufferMinutes,
    });
    blockedEnd = event.end.plus({
      minutes: MEETING_CONFIG.bty_interview.postBufferMinutes,
    });
  } else if (event.isPreInterview) {
    blockedEnd = event.end.plus({
      minutes: MEETING_CONFIG.pre_interview.postBufferMinutes,
    });
  }

  return slotStart < blockedEnd && candidateEnd > blockedStart;
}

function meetingTypeConflicts(
  meetingType: MeetingType,
  slotStart: DateTime,
  slotEnd: DateTime,
  event: BusyEvent,
) {
  return meetingType === "pre_interview"
    ? preInterviewSlotConflicts(slotStart, slotEnd, event)
    : btyInterviewSlotConflicts(slotStart, slotEnd, event);
}

function centralDateKey(value: DateTime) {
  return value.setZone(CENTRAL_ZONE).toFormat("yyyy-MM-dd");
}

async function activeMeetingCountsByDate(
  admin: SupabaseClient,
  purpose: "bty_recording" | "bty_preinterview",
  rangeStart: DateTime,
  rangeEnd: DateTime,
  excludeMeetingId?: string,
) {
  let query = admin
    .from("relationship_meetings")
    .select("starts_at")
    .eq("tenant_id", TENANT_ID)
    .eq("purpose", purpose)
    .in("event_status", ["tentative", "confirmed"])
    .gte("starts_at", rangeStart.toUTC().toISO()!)
    .lt("starts_at", rangeEnd.toUTC().toISO()!);
  // Exclude the booking's own tentative reservation during the post-reservation recheck.
  if (excludeMeetingId) {
    query = query.neq("id", excludeMeetingId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const start = DateTime.fromISO(String(row.starts_at));
    if (!start.isValid) continue;
    const key = centralDateKey(start);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function slotStartForDay(day: DateTime, minutesFromMidnight: number) {
  return day.set({
    hour: Math.floor(minutesFromMidnight / 60),
    minute: minutesFromMidnight % 60,
    second: 0,
    millisecond: 0,
  });
}

async function computeAvailability(
  admin: SupabaseClient,
  meetingType: MeetingType,
  exclusion?: BookingExclusion,
) {
  const config = MEETING_CONFIG[meetingType];
  const firstDay = firstBookableMonday();
  const rangeEnd = firstDay.plus({ weeks: AVAILABILITY_WEEKS });
  const purpose = meetingPurpose(meetingType);
  const [busy, activeCounts] = await Promise.all([
    collectBusyEvents(
      admin,
      firstDay.minus({ hours: 3 }),
      rangeEnd.plus({ hours: 3 }),
      exclusion,
    ),
    activeMeetingCountsByDate(
      admin,
      purpose,
      firstDay,
      rangeEnd,
      exclusion?.meetingId ?? undefined,
    ),
  ]);

  const blockedBtyDates = new Set(
    meetingType === "bty_interview"
      ? [...activeCounts.entries()]
          .filter(([, count]) => count >= 1)
          .map(([date]) => date)
      : [],
  );
  for (const event of busy) {
    if (event.source === "google" && event.isBtyRecording) {
      blockedBtyDates.add(centralDateKey(event.start));
    }
  }

  const days: Array<{
    date: string;
    slots: Array<{ startUtc: string; endUtc: string }>;
  }> = [];

  for (
    let day = firstDay;
    day < rangeEnd;
    day = day.plus({ days: 1 })
  ) {
    if (day.weekday > 5) continue;
    const dateKey = day.toFormat("yyyy-MM-dd");

    if (
      meetingType === "bty_interview" &&
      blockedBtyDates.has(dateKey)
    ) {
      continue;
    }
    if (
      meetingType === "pre_interview" &&
      (activeCounts.get(dateKey) ?? 0) >= 2
    ) {
      continue;
    }

    const slots: Array<{ startUtc: string; endUtc: string }> = [];
    for (
      let minutes = DAY_START_MINUTES;
      minutes + config.durationMinutes <= DAY_END_MINUTES;
      minutes += config.slotStepMinutes
    ) {
      const start = slotStartForDay(day, minutes);
      const end = start.plus({ minutes: config.durationMinutes });
      if (
        busy.some((event) =>
          meetingTypeConflicts(meetingType, start, end, event)
        )
      ) {
        continue;
      }
      slots.push({
        startUtc: start.toUTC().toISO()!,
        endUtc: end.toUTC().toISO()!,
      });
    }
    if (slots.length) days.push({ date: dateKey, slots });
  }

  return {
    meetingType,
    timezone: CENTRAL_ZONE,
    firstBookableDate: firstDay.toFormat("yyyy-MM-dd"),
    lastBookableDate: rangeEnd.minus({ days: 1 }).toFormat("yyyy-MM-dd"),
    days,
  };
}

async function selectedSlotAvailable(
  admin: SupabaseClient,
  meetingType: MeetingType,
  start: DateTime,
  end: DateTime,
  exclusion?: BookingExclusion,
) {
  const config = MEETING_CONFIG[meetingType];
  const firstDay = firstBookableMonday();
  const finalDay = firstDay.plus({ weeks: AVAILABILITY_WEEKS });
  const minutesFromMidnight = start.hour * 60 + start.minute;

  if (
    start < firstDay ||
    start >= finalDay ||
    start.weekday > 5 ||
    start.second !== 0 ||
    minutesFromMidnight < DAY_START_MINUTES ||
    minutesFromMidnight + config.durationMinutes > DAY_END_MINUTES ||
    (minutesFromMidnight - DAY_START_MINUTES) % config.slotStepMinutes !== 0
  ) {
    console.warn("BTY scheduler slot rejected: outside_booking_window", {
      meetingType,
      startUtc: start.toUTC().toISO(),
      centralTime: start.toISO(),
      firstBookable: firstDay.toISODate(),
      lastBookable: finalDay.toISODate(),
    });
    return false;
  }

  const dayStart = start.startOf("day");
  const dayEnd = dayStart.plus({ days: 1 });
  const purpose = meetingPurpose(meetingType);
  const [counts, busy] = await Promise.all([
    activeMeetingCountsByDate(
      admin,
      purpose,
      dayStart,
      dayEnd,
      exclusion?.meetingId ?? undefined,
    ),
    collectBusyEvents(
      admin,
      dayStart.minus({ hours: 3 }),
      dayEnd.plus({ hours: 3 }),
      exclusion,
    ),
  ]);
  const count = counts.get(centralDateKey(start)) ?? 0;

  if ((meetingType === "bty_interview" && count >= 1) ||
      (meetingType === "pre_interview" && count >= 2)) {
    console.warn("BTY scheduler slot rejected: daily_capacity_reached", {
      meetingType,
      startUtc: start.toUTC().toISO(),
      activeMeetingCount: count,
    });
    return false;
  }

  if (
    meetingType === "bty_interview" &&
    busy.some(
      (event) =>
        event.source === "google" &&
        event.isBtyRecording &&
        centralDateKey(event.start) === centralDateKey(start),
    )
  ) {
    console.warn("BTY scheduler slot rejected: existing_recording_on_day", {
      meetingType,
      startUtc: start.toUTC().toISO(),
    });
    return false;
  }

  const conflict = busy.find((event) =>
    meetingTypeConflicts(meetingType, start, end, event)
  );
  if (conflict) {
    console.warn("BTY scheduler slot rejected: calendar_overlap", {
      meetingType,
      startUtc: start.toUTC().toISO(),
      source: conflict.source,
      sourceId: conflict.sourceId,
      busyStartUtc: conflict.start.toUTC().toISO(),
      busyEndUtc: conflict.end.toUTC().toISO(),
      eventIsBtyRecording: conflict.isBtyRecording,
      eventIsPreInterview: conflict.isPreInterview,
      allDay: conflict.allDay,
    });
    return false;
  }
  return true;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

async function decryptToken(encrypted: string, keyHex: string) {
  const [ivHex, ciphertextHex] = encrypted.split(":");
  if (!ivHex || !ciphertextHex) throw new Error("Calendar write connection is invalid.");
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    hexToBytes(keyHex),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBytes(ivHex) },
    cryptoKey,
    hexToBytes(ciphertextHex),
  );
  return new TextDecoder().decode(plaintext);
}

async function calendarWriteAccess(admin: SupabaseClient) {
  const { data: connection, error } = await admin
    .from("staff_calendar_connections")
    .select(
      "id,selected_calendar_id,refresh_token_encrypted,connection_status",
    )
    .eq("staff_id", BTY_STAFF_ID)
    .eq("provider", "google")
    .eq("connection_status", "connected")
    .maybeSingle();
  if (error || !connection || !connection.refresh_token_encrypted) {
    throw new Error("Calendar booking is temporarily unavailable.");
  }
  if (connection.selected_calendar_id !== INFO_CALENDAR) {
    throw new Error("Calendar booking is temporarily unavailable.");
  }

  if (
    writeTokenCache &&
    writeTokenCache.connectionId === connection.id &&
    writeTokenCache.calendarId === connection.selected_calendar_id &&
    writeTokenCache.expiresAt > Date.now() + 60_000
  ) {
    return {
      accessToken: writeTokenCache.token,
      calendarId: writeTokenCache.calendarId,
    };
  }

  const encryptionKey = Deno.env.get("TOKEN_ENCRYPTION_KEY") ?? "";
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "";
  if (!encryptionKey || !clientId || !clientSecret) {
    throw new Error("Calendar booking is temporarily unavailable.");
  }
  const refreshToken = await decryptToken(
    connection.refresh_token_encrypted,
    encryptionKey,
  );
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || typeof body.access_token !== "string") {
    writeTokenCache = null;
    await admin
      .from("staff_calendar_connections")
      .update({
        connection_status: "needs_reconnect",
        last_error: "BTY scheduler token refresh failed",
      })
      .eq("id", connection.id);
    throw new Error("Calendar booking is temporarily unavailable.");
  }

  const expiresInSeconds =
    typeof body.expires_in === "number" && Number.isFinite(body.expires_in)
      ? body.expires_in
      : 3600;
  writeTokenCache = {
    connectionId: connection.id,
    token: body.access_token,
    calendarId: connection.selected_calendar_id,
    expiresAt: Date.now() + Math.max(60, expiresInSeconds - 60) * 1000,
  };

  return {
    accessToken: writeTokenCache.token,
    calendarId: writeTokenCache.calendarId,
  };
}

async function readGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?conferenceDataVersion=1`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) return null;
  return await response.json().catch(() => null) as CalendarEvent | null;
}

async function createGoogleEvent(
  admin: SupabaseClient,
  input: {
    meetingType: MeetingType;
    start: DateTime;
    end: DateTime;
    guestName: string;
    organizationName: string;
    guestEmail: string;
    opportunityId: string | null;
    organizationId: string;
  },
) {
  const write = await calendarWriteAccess(admin);
  const isPreInterview = input.meetingType === "pre_interview";
  const summaryBase = isPreInterview
    ? "Beyond The Yellow Pre-Interview"
    : "Beyond The Yellow";
  const summary = input.guestName
    ? `${summaryBase} | ${input.guestName} | ${input.organizationName}`
    : `${summaryBase} | ${input.organizationName}`;

  const body: Record<string, unknown> = {
    summary,
    description: isPreInterview
      ? "Beyond The Yellow pre-interview with ValorWell.\n\nScheduled in Central Time."
      : `Beyond The Yellow prerecorded conversation with ValorWell.\n\nJoin the recording: ${STREAMYARD_URL}\n\nScheduled in Central Time.`,
    ...(isPreInterview ? {} : { location: STREAMYARD_URL }),
    start: {
      dateTime: input.start.toISO({ suppressMilliseconds: true }),
      timeZone: CENTRAL_ZONE,
    },
    end: {
      dateTime: input.end.toISO({ suppressMilliseconds: true }),
      timeZone: CENTRAL_ZONE,
    },
    attendees: [{ email: input.guestEmail }],
    transparency: "opaque",
    extendedProperties: {
      private: {
        source: "bty_public_scheduler",
        meetingType: input.meetingType,
        relationshipOrganizationId: input.organizationId,
        ...(input.opportunityId
          ? { relationshipOpportunityId: input.opportunityId }
          : {}),
      },
    },
    ...(isPreInterview
      ? {
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }
      : {}),
  };

  const params = new URLSearchParams({ sendUpdates: "all" });
  if (isPreInterview) params.set("conferenceDataVersion", "1");

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(write.calendarId)}/events?${params}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${write.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  let event = await response.json().catch(() => ({})) as CalendarEvent & Record<string, unknown>;
  if (!response.ok || typeof event.id !== "string") {
    console.error("BTY scheduler Google event creation failed", {
      meetingType: input.meetingType,
      status: response.status,
      event,
    });
    throw new Error("The calendar invitation could not be created.");
  }

  if (isPreInterview) {
    let meetUrl = meetingUrlFromCalendarEvent(event);
    let conferenceStatus =
      event.conferenceData?.createRequest?.status?.statusCode ?? null;

    for (
      let attempt = 0;
      !meetUrl && conferenceStatus !== "failure" && attempt < 6;
      attempt += 1
    ) {
      await new Promise((resolve) => setTimeout(resolve, 350 + attempt * 150));
      const refreshed = await readGoogleEvent(
        write.accessToken,
        write.calendarId,
        event.id,
      );
      if (!refreshed) continue;
      event = { ...event, ...refreshed };
      meetUrl = meetingUrlFromCalendarEvent(event);
      conferenceStatus =
        event.conferenceData?.createRequest?.status?.statusCode ?? null;
    }

    if (conferenceStatus === "failure") {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(write.calendarId)}/events/${encodeURIComponent(event.id)}?sendUpdates=all`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${write.accessToken}` },
        },
      ).catch(() => undefined);
      throw new Error("The Google Meet link could not be created.");
    }

    return {
      ...event,
      schedulerMeetingUrl: meetUrl,
    };
  }

  return {
    ...event,
    schedulerMeetingUrl: STREAMYARD_URL,
  };
}

// ---------------------------------------------------------------------------
// Scheduler-owned booking release (guest "I need a different time", all-guest
// decline sweep, and manually deleted Google events).
// ---------------------------------------------------------------------------

const REBOOK_URL = "https://valorwell.org/beyond-the-yellow/schedule";
const DECLINE_GRACE_MS = 60_000;
const SCHEDULER_SOURCE = "bty_public_scheduler";

type ReleaseReason = "guest_requested" | "all_declined" | "event_deleted";

type ReleasableMeeting = {
  id: string;
  purpose?: string | null;
  organization_id?: string | null;
  contact_id?: string | null;
  starts_at?: string | null;
  external_event_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

type CalendarWrite = { accessToken: string; calendarId: string };

type RollbackOriginal = {
  opportunity: {
    id: string;
    status: string | null;
    next_action: string | null;
    next_action_due_at: string | null;
    bty_scheduler_booking: unknown;
  } | null;
  organization: {
    id: string;
    next_action: string | null;
    next_action_due_at: string | null;
  };
};

function isSchedulerOwned(meeting: ReleasableMeeting | Record<string, unknown> | null) {
  if (!meeting) return false;
  const metadata = (meeting as ReleasableMeeting).metadata;
  return Boolean((meeting as ReleasableMeeting).id) && metadata?.source === SCHEDULER_SOURCE;
}

function hasRealEventId(value: unknown) {
  return typeof value === "string" && value.length > 0 && !value.startsWith("pending:");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function meetingTypeFromPurpose(purpose: unknown): MeetingType | null {
  if (purpose === "bty_preinterview") return "pre_interview";
  if (purpose === "bty_recording") return "bty_interview";
  return null;
}

async function captureRollbackSnapshot(
  admin: SupabaseClient,
  context: { organization: OrganizationRecord; opportunity: OpportunityRecord | null },
  reservationId: string,
): Promise<{ original: RollbackOriginal; carriedForwardOpportunityCreated: boolean | null } | null> {
  // If another active scheduler-owned booking for this organization already
  // holds a snapshot, carry its pre-booking state forward so releases in any
  // order restore the true original state.
  const { data: siblings, error: siblingError } = await admin
    .from("relationship_meetings")
    .select("id,scheduler_rollback,metadata")
    .eq("tenant_id", TENANT_ID)
    .eq("organization_id", context.organization.id)
    .in("purpose", ["bty_recording", "bty_preinterview"])
    .in("event_status", ["tentative", "confirmed"])
    .neq("id", reservationId)
    .not("scheduler_rollback", "is", null);
  if (siblingError) throw new Error(siblingError.message);
  const sibling = (siblings ?? []).find((row) => {
    const rollback = row.scheduler_rollback as Record<string, unknown> | null;
    return (row.metadata as Record<string, unknown> | null)?.source === SCHEDULER_SOURCE &&
      rollback && typeof rollback === "object" && rollback.original;
  });
  if (sibling) {
    const rollback = sibling.scheduler_rollback as Record<string, unknown>;
    return {
      original: rollback.original as RollbackOriginal,
      carriedForwardOpportunityCreated: rollback.opportunity_created === true,
    };
  }

  const { data: org, error: orgError } = await admin
    .from("relationship_organizations")
    .select("id,next_action,next_action_due_at")
    .eq("id", context.organization.id)
    .maybeSingle();
  if (orgError || !org) throw new Error(orgError?.message ?? "Organization not found");

  let opportunity: RollbackOriginal["opportunity"] = null;
  if (context.opportunity) {
    const { data: opp, error: oppError } = await admin
      .from("relationship_opportunities")
      .select("id,status,next_action,next_action_due_at,metadata")
      .eq("id", context.opportunity.id)
      .eq("organization_id", context.organization.id)
      .maybeSingle();
    if (oppError) throw new Error(oppError.message);
    if (opp) {
      const metadata = (opp.metadata ?? {}) as Record<string, unknown>;
      opportunity = {
        id: String(opp.id),
        status: opp.status ?? null,
        next_action: opp.next_action ?? null,
        next_action_due_at: opp.next_action_due_at ?? null,
        bty_scheduler_booking: metadata.bty_scheduler_booking ?? null,
      };
    }
  }

  return {
    original: {
      opportunity,
      organization: {
        id: String(org.id),
        next_action: org.next_action ?? null,
        next_action_due_at: org.next_action_due_at ?? null,
      },
    },
    carriedForwardOpportunityCreated: null,
  };
}

async function deleteGoogleEvent(write: CalendarWrite, eventId: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(write.calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    { method: "DELETE", headers: { authorization: `Bearer ${write.accessToken}` } },
  );
  await response.text().catch(() => "");
  if (![200, 204, 404, 410].includes(response.status)) {
    throw new Error(`Google Calendar event deletion failed (${response.status}).`);
  }
}

async function sendRebookingEmail(
  meeting: ReleasableMeeting,
  contact: ContactRecord | null,
  reason: Exclude<ReleaseReason, "event_deleted">,
) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const recipient =
    normalizeEmail(meeting.metadata?.booked_by_email) || normalizeEmail(contact?.email);
  if (!apiKey || !recipient) {
    console.error("BTY rebooking email skipped", {
      meetingId: meeting.id, hasApiKey: Boolean(apiKey), hasRecipient: Boolean(recipient),
    });
    return;
  }
  const meetingType = meetingTypeFromPurpose(meeting.purpose);
  const label = meetingType === "pre_interview" ? "pre-interview" : "recording";
  const start = DateTime.fromISO(String(meeting.starts_at ?? ""), { zone: "utc" })
    .setZone(CENTRAL_ZONE);
  const dayLabel = start.isValid ? start.toFormat("cccc, LLLL d") : "your scheduled day";
  const timeLabel = start.isValid ? `${start.toFormat("h:mm a")} Central Time` : "";
  const name = contact ? displayName(contact) : "there";
  const when = timeLabel ? `${dayLabel} at ${timeLabel}` : dayLabel;
  const reasonLine = reason === "guest_requested"
    ? `As you requested, we've cancelled your Beyond The Yellow ${label} on ${when}.`
    : `Since the calendar invitation was declined, we've cancelled your Beyond The Yellow ${label} on ${when}.`;
  const subject = `Your Beyond The Yellow ${label} has been cancelled. Choose a new time`;
  const html = `<!doctype html><html><body style="font-family:'Trebuchet MS',Arial,sans-serif;color:#111814;background:#F4F1E8;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;">
<p>Hi ${escapeHtml(name)},</p>
<p>${escapeHtml(reasonLine)}</p>
<p>We&rsquo;d still love to talk with you.</p>
<p style="margin:28px 0;"><a href="${escapeHtml(REBOOK_URL)}" style="background:#3B5147;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:10px;display:inline-block;">Choose a new time</a></p>
<p>When the scheduler opens, use this same email address (${escapeHtml(recipient)}) to pick a new time.</p>
<p>Questions? Just reply to this email.</p>
<p>&mdash; The ValorWell team</p>
</div></body></html>`;
  const text = `Hi ${name},\n\n${reasonLine}\n\nWe’d still love to talk with you.\n\nChoose a new time: ${REBOOK_URL}\nUse this same email address (${recipient}) when the scheduler asks.\n\nQuestions? Just reply to this email.\n\n— The ValorWell team`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "ValorWell <noreply@valorwell.org>",
        to: [recipient],
        bcc: [INFO_CALENDAR],
        reply_to: INFO_CALENDAR,
        subject,
        html,
        text,
      }),
    });
    if (!response.ok) {
      console.error("BTY rebooking email failed", {
        meetingId: meeting.id, status: response.status, body: await response.text().catch(() => ""),
      });
    }
  } catch (emailError) {
    console.error("BTY rebooking email exception", {
      meetingId: meeting.id,
      error: emailError instanceof Error ? emailError.message : String(emailError),
    });
  }
}

/**
 * Shared release: delete the Google event (unless it is already gone), then
 * atomically delete the meeting + roll back CRM through the RPC, then email.
 * Any non-accepted Google DELETE response aborts BEFORE the RPC.
 */
async function releaseBooking(
  admin: SupabaseClient,
  write: CalendarWrite,
  meeting: ReleasableMeeting,
  reason: ReleaseReason,
  contact: ContactRecord | null,
) {
  if (!isSchedulerOwned(meeting)) {
    throw new Error("Only scheduler-owned appointments can be released.");
  }
  if (reason !== "event_deleted" && hasRealEventId(meeting.external_event_id)) {
    await deleteGoogleEvent(write, String(meeting.external_event_id));
  }
  const { error } = await admin.rpc("release_bty_scheduler_booking", {
    p_meeting_id: meeting.id,
  });
  if (error) throw new Error(`Booking release failed: ${error.message}`);
  if (reason !== "event_deleted") {
    await sendRebookingEmail(meeting, contact, reason);
  }
}

async function handleRelease(admin: SupabaseClient, input: Record<string, unknown>) {
  const meetingType = parseMeetingType(input.meetingType);
  if (!meetingType) {
    return json({ released: false, error: "A valid meeting type is required." }, 400);
  }
  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  const meeting = meetingForType(context, meetingType) as ReleasableMeeting | null;
  const trace = (eventType: SchedulerTrackingEvent, more: Partial<TrackingDetails> = {}) =>
    recordSchedulerEvent(admin, trackingContext(input, session, eventType, {
      contactId: context.contact.id,
      organizationId: context.organization.id,
      opportunityId: context.opportunity?.id ?? null,
      meetingType,
      startUtc: meeting?.starts_at ?? null,
      calendarEventId: meeting?.external_event_id ?? null,
      ...more,
    }));

  if (!meeting) {
    return json({ released: false, error: "No appointment was found to change." }, 404);
  }
  if (!meeting.id || meeting.metadata?.source !== SCHEDULER_SOURCE) {
    return json({
      released: false,
      error: "This appointment can't be changed here. Email info@valorwell.org and we'll help.",
    }, 409);
  }
  const start = DateTime.fromISO(String(meeting.starts_at ?? ""), { zone: "utc" });
  if (!start.isValid || start <= DateTime.utc()) {
    return json({
      released: false,
      error: "This appointment has already started. Email info@valorwell.org and we'll help.",
    }, 409);
  }

  try {
    const write = await calendarWriteAccess(admin);
    await releaseBooking(admin, write, meeting, "guest_requested", context.contact);
  } catch (releaseError) {
    console.error("BTY guest release failed", {
      meetingId: meeting.id,
      error: releaseError instanceof Error ? releaseError.message : String(releaseError),
    });
    await trace("booking_release_failed", {
      failureStage: "release", failureCode: "guest_requested", httpStatus: 500,
    });
    return json({
      released: false,
      error: "We couldn't cancel that appointment right now. Please try again or email info@valorwell.org.",
    }, 500);
  }
  await trace("booking_released", { failureCode: "guest_requested", httpStatus: 200 });
  return json({ released: true, meetingType });
}

function timingSafeEqualString(a: string, b: string) {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let diff = aBytes.length ^ bBytes.length;
  const length = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < length; i += 1) diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  return diff === 0;
}

function externalGuestAttendees(event: CalendarEvent) {
  return (event.attendees ?? []).filter((attendee) => {
    const email = normalizeEmail(attendee.email);
    return Boolean(email) && !attendee.organizer && !attendee.self &&
      !attendee.resource && email !== INFO_CALENDAR;
  });
}

async function handleSweepDeclines(request: Request, admin: SupabaseClient) {
  const expected = Deno.env.get("CRON_SECRET") ?? "";
  const provided = request.headers.get("x-cron-secret") ?? "";
  if (!expected || !provided || !timingSafeEqualString(provided, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const summary = { checked: 0, declinesPending: 0, released: 0, errors: 0 };
  const { data: candidates, error: candidateError } = await admin
    .from("relationship_meetings")
    .select("id,purpose,organization_id,contact_id,starts_at,external_event_id,metadata,decline_detected_at")
    .eq("tenant_id", TENANT_ID)
    .in("purpose", ["bty_recording", "bty_preinterview"])
    .eq("event_status", "confirmed")
    .eq("calendar_id", INFO_CALENDAR)
    .eq("metadata->>source", SCHEDULER_SOURCE)
    .gt("starts_at", new Date().toISOString())
    .not("external_event_id", "is", null)
    .not("external_event_id", "like", "pending:%");
  if (candidateError) throw new Error(candidateError.message);
  const meetings = ((candidates ?? []) as Array<ReleasableMeeting & { decline_detected_at?: string | null }>)
    .filter((meeting) => isSchedulerOwned(meeting) && hasRealEventId(meeting.external_event_id));
  if (!meetings.length) return json(summary);

  // One Google write token for the whole sweep.
  const write = await calendarWriteAccess(admin);

  const loadContact = async (contactId: string | null | undefined) => {
    if (!contactId) return null;
    const { data } = await admin.from("relationship_contacts")
      .select("id,email,first_name,last_name,preferred_name")
      .eq("id", contactId).maybeSingle();
    return (data as ContactRecord | null) ?? null;
  };

  for (const meeting of meetings) {
    summary.checked += 1;
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(write.calendarId)}/events/${encodeURIComponent(String(meeting.external_event_id))}`,
        { headers: { authorization: `Bearer ${write.accessToken}` } },
      );
      if (response.status === 404 || response.status === 410) {
        await response.text().catch(() => "");
        await releaseBooking(admin, write, meeting, "event_deleted", null);
        summary.released += 1;
        continue;
      }
      if (!response.ok) {
        console.error("BTY decline sweep event read failed", {
          meetingId: meeting.id, status: response.status,
        });
        await response.text().catch(() => "");
        summary.errors += 1;
        continue;
      }
      const event = await response.json() as CalendarEvent;
      if (event.status === "cancelled") {
        await releaseBooking(admin, write, meeting, "event_deleted", null);
        summary.released += 1;
        continue;
      }

      const guests = externalGuestAttendees(event);
      // A reschedule that Google answered with stale "declined" RSVPs stores
      // the moved event's `updated` fingerprint. While the event is unchanged
      // since that move, those RSVPs are stale; any real post-move decline
      // changes `updated` and is handled normally.
      const rsvpGuard = (meeting.metadata?.reschedule_rsvp_guard as
        { event_updated?: unknown } | undefined)?.event_updated;
      const staleFromMove = typeof rsvpGuard === "string" && rsvpGuard.length > 0 &&
        event.updated === rsvpGuard;
      // tentative and needsAction never count as declined.
      const allDeclined = !staleFromMove && guests.length > 0 &&
        guests.every((guest) => guest.responseStatus === "declined");

      if (!allDeclined) {
        if (meeting.decline_detected_at) {
          const { error } = await admin.from("relationship_meetings")
            .update({ decline_detected_at: null }).eq("id", meeting.id);
          if (error) throw new Error(error.message);
        }
        continue;
      }

      if (!meeting.decline_detected_at) {
        const { error } = await admin.from("relationship_meetings")
          .update({ decline_detected_at: new Date().toISOString() }).eq("id", meeting.id);
        if (error) throw new Error(error.message);
        summary.declinesPending += 1;
        continue;
      }

      const detectedAt = Date.parse(meeting.decline_detected_at);
      if (!Number.isFinite(detectedAt) || Date.now() - detectedAt < DECLINE_GRACE_MS) {
        summary.declinesPending += 1;
        continue;
      }

      await releaseBooking(admin, write, meeting, "all_declined", await loadContact(meeting.contact_id));
      summary.released += 1;
    } catch (itemError) {
      summary.errors += 1;
      console.error("BTY decline sweep item failed", {
        meetingId: meeting.id,
        error: itemError instanceof Error ? itemError.message : String(itemError),
      });
    }
  }
  return json(summary);
}

async function handleValidate(
  request: Request,
  admin: SupabaseClient,
  input: Record<string, unknown>,
) {
  if (!checkValidateRateLimit(request)) {
    return json(
      { eligible: false, error: "Too many attempts. Please try again later." },
      429,
    );
  }
  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await recordSchedulerEvent(admin, {
      eventType: "invitation_rejected",
      sessionId: trackingId(input.visitorSessionId),
      failureCode: "invalid_email_format", httpStatus: 200,
    });
    return json({ eligible: false });
  }
  const context = await resolveContactContext(admin, email);
  if (!context) {
    await recordSchedulerEvent(admin, {
      eventType: "invitation_rejected",
      sessionId: trackingId(input.visitorSessionId),
      failureCode: "no_active_invitation", httpStatus: 200,
    });
    return json({ eligible: false });
  }
  await recordSchedulerEvent(admin, {
    eventType: "invitation_verified",
    sessionId: trackingId(input.visitorSessionId),
    contactId: context.contact.id, organizationId: context.organization.id,
    opportunityId: context.opportunity?.id ?? null,
    httpStatus: 200,
  });

  const contactName = displayName(context.contact);
  const sessionToken = await issueSession({
    contactId: context.contact.id,
    organizationId: context.organization.id,
    opportunityId: context.opportunity?.id ?? null,
    email,
  });

  return json({
    eligible: true,
    state: "ready",
    sessionToken,
    expiresInSeconds: SESSION_TTL_SECONDS,
    contact: { name: contactName, email },
    organization: {
      id: context.organization.id,
      name: context.organization.name,
    },
    bookings: {
      preInterview: serializeBooking(
        context.bookings.preInterview,
        "pre_interview",
      ),
      btyInterview: serializeBooking(
        context.bookings.btyInterview,
        "bty_interview",
      ),
    },
  });
}

async function handleAvailability(
  admin: SupabaseClient,
  input: Record<string, unknown>,
) {
  const meetingType = parseMeetingType(input.meetingType);
  if (!meetingType) {
    return json({ error: "A valid meeting type is required." }, 400);
  }

  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  const existing = meetingForType(context, meetingType);

  if (input.mode === "reschedule") {
    // Read-only preview: nothing is cancelled or changed here.
    const check = reschedulableMeeting(existing);
    if (!check.ok) {
      return json({ state: existing ? "booked" : "none", error: check.error }, check.status);
    }
    const exclusion = await exclusionForMeeting(admin, check.meeting);
    const availability = await computeAvailability(admin, meetingType, exclusion);
    await recordSchedulerEvent(
      admin,
      trackingContext(input, session, "availability_viewed", {
        contactId: context.contact.id,
        organizationId: context.organization.id,
        opportunityId: context.opportunity?.id ?? null,
        meetingType,
        failureStage: "reschedule_preview",
        calendarEventId: check.meeting.external_event_id ?? null,
        httpStatus: 200,
      }),
    );
    return json({
      state: "reschedule",
      currentBooking: serializeBooking(existing, meetingType),
      ...availability,
    });
  }

  if (existing) {
    return json(
      {
        state: "booked",
        booking: serializeBooking(existing, meetingType),
      },
      409,
    );
  }

  const availability = await computeAvailability(admin, meetingType);
  await recordSchedulerEvent(
    admin,
    trackingContext(input, session, "availability_viewed", {
      contactId: context.contact.id,
      organizationId: context.organization.id,
      opportunityId: context.opportunity?.id ?? null,
      meetingType,
      httpStatus: 200,
    }),
  );
  return json({
    state: "ready",
    ...availability,
  });
}

async function reconcileConfirmedBooking(
  admin: SupabaseClient,
  context: {
    contact: ContactRecord;
    organization: OrganizationRecord;
    opportunity: OpportunityRecord | null;
  },
  reservationId: string,
  meetingType: MeetingType,
  startUtc: string,
  calendarEventId: string,
): Promise<{ opportunityCreated: boolean }> {
  let opportunity = context.opportunity;
  let opportunityCreated = false;
  if (!opportunity) {
    // Invited organizations may predate the CRM opportunity workflow.
    // Create a BTY opportunity only AFTER the Google event and meeting are
    // confirmed; never attach an unrelated opportunity by guesswork.
    const targetStatus =
      meetingType === "pre_interview" ? "pre_interview_scheduled" : "booked";
    const nextAction =
      meetingType === "pre_interview"
        ? "Attend confirmed Beyond The Yellow pre-interview; Google Calendar invitation sent."
        : "Attend confirmed Beyond The Yellow recording; StreamYard invitation sent.";
    const { data: created, error: createError } = await admin
      .from("relationship_opportunities")
      .insert({
        tenant_id: TENANT_ID,
        organization_id: context.organization.id,
        primary_contact_id: context.contact.id,
        status: targetStatus,
        veteran_priority: true,
        review_status: "approved",
        next_action: nextAction,
        next_action_due_at: startUtc,
        metadata: {
          initiative: "Beyond The Yellow",
          source: "bty_public_scheduler",
          bty_scheduler_booking: {
            source: "bty_public_scheduler",
            meeting_type: meetingType,
            meeting_id: reservationId,
            calendar_event_id: calendarEventId,
            start_utc: startUtc,
            confirmed_at: new Date().toISOString(),
          },
        },
      })
      .select("id,organization_id,primary_contact_id,status,version,qualification,metadata,updated_at")
      .single();
    if (createError || !created) {
      console.error("BTY booking missing opportunity could not be created", {
        organizationId: context.organization.id,
        reservationId,
        error: createError,
      });
      return { opportunityCreated: false };
    }
    opportunity = created as OpportunityRecord;
    opportunityCreated = true;
    const { error: linkError } = await admin
      .from("relationship_meetings")
      .update({ opportunity_id: opportunity.id })
      .eq("id", reservationId)
      .eq("organization_id", context.organization.id);
    if (linkError) {
      console.error("BTY booking new opportunity link failed", {
        organizationId: context.organization.id,
        reservationId,
        opportunityId: opportunity.id,
        error: linkError,
      });
    }
  }

  const { data: fresh, error: fetchError } = await admin
    .from("relationship_opportunities")
    .select("id,tenant_id,status,version,metadata")
    .eq("id", opportunity.id)
    .eq("organization_id", context.organization.id)
    .maybeSingle();
  if (fetchError || !fresh) {
    console.error("BTY booking CRM lookup failed", {
      opportunityId: opportunity.id, reservationId, error: fetchError,
    });
    return { opportunityCreated };
  }

  const closed = ["completed", "declined", "disqualified"].includes(fresh.status);
  const allowedPreStatuses = [
    "identified", "researching", "qualified", "ready_for_campaign",
    "contacted", "responded", "interested", "pre_interview_scheduled",
  ];
  const targetStatus =
    meetingType === "pre_interview" ? "pre_interview_scheduled" : "booked";
  const advanceStatus =
    !closed &&
    (meetingType === "bty_interview" ||
      allowedPreStatuses.includes(fresh.status));
  const statusChanged = advanceStatus && fresh.status !== targetStatus;
  const nextAction =
    meetingType === "pre_interview"
      ? "Attend confirmed Beyond The Yellow pre-interview; Google Calendar invitation sent."
      : "Attend confirmed Beyond The Yellow recording; StreamYard invitation sent.";
  const recordedAt = new Date().toISOString();
  const metadata = {
    ...(fresh.metadata ?? {}),
    bty_scheduler_booking: {
      source: "bty_public_scheduler",
      meeting_type: meetingType,
      meeting_id: reservationId,
      calendar_event_id: calendarEventId,
      start_utc: startUtc,
      confirmed_at: recordedAt,
    },
  };
  const updates: Record<string, unknown> = { metadata };
  if (!closed) {
    updates.next_action = nextAction;
    updates.next_action_due_at = startUtc;
  }
  if (statusChanged) {
    updates.status = targetStatus;
    updates.status_changed_at = recordedAt;
  }
  const { data: updated, error: updateError } = await admin
    .from("relationship_opportunities")
    .update(updates)
    .eq("id", opportunity.id)
    .eq("version", fresh.version)
    .select("id,version")
    .maybeSingle();
  if (updateError || !updated) {
    console.error("BTY booking CRM update failed", {
      opportunityId: opportunity.id, reservationId, error: updateError,
    });
    return { opportunityCreated };
  }
  if (statusChanged) {
    const { error: historyError } = await admin
      .from("relationship_opportunity_status_history")
      .insert({
        tenant_id: TENANT_ID,
        opportunity_id: opportunity.id,
        from_status: fresh.status,
        to_status: targetStatus,
        changed_at: recordedAt,
        reason: "BTY guest confirmed the appointment through the public scheduler.",
        version: updated.version,
        metadata: {
          source: "bty_public_scheduler",
          meeting_id: reservationId,
          calendar_event_id: calendarEventId,
        },
      });
    if (historyError) console.error("BTY booking status history failed", {
      opportunityId: opportunity.id, reservationId, error: historyError,
    });
  }

  const { error: orgError } = await admin
    .from("relationship_organizations")
    .update({ next_action: nextAction, next_action_due_at: startUtc })
    .eq("id", context.organization.id);
  if (orgError) console.error("BTY booking organization action failed", {
    organizationId: context.organization.id, reservationId, error: orgError,
  });

  const { error: activityError } = await admin
    .from("relationship_interactions")
    .insert({
      tenant_id: TENANT_ID,
      organization_id: context.organization.id,
      contact_id: context.contact.id,
      opportunity_id: opportunity.id,
      interaction_type: "manual_note",
      occurred_at: recordedAt,
      summary: "Confirmed " +
        (meetingType === "pre_interview" ? "BTY pre-interview" : "BTY full interview") +
        " through the public scheduler; Google Calendar invitation sent.",
      metadata: {
        source: "bty_public_scheduler",
        meeting_id: reservationId,
        calendar_event_id: calendarEventId,
        meeting_type: meetingType,
        start_utc: startUtc,
      },
    });
  if (activityError) console.error("BTY booking CRM activity failed", {
    opportunityId: opportunity.id, reservationId, error: activityError,
  });
  return { opportunityCreated };
}

async function handleBook(
  admin: SupabaseClient,
  input: Record<string, unknown>,
) {
  const meetingType = parseMeetingType(input.meetingType);
  if (!meetingType) {
    return json({ booked: false, error: "A valid meeting type is required." }, 400);
  }

  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  const startForTracking = String(input.startUtc ?? "");
  const attemptedStart = DateTime.fromISO(startForTracking, { zone: "utc" });
  const bookTrace = (eventType: SchedulerTrackingEvent, options: Partial<TrackingDetails> = {}) =>
    recordSchedulerEvent(admin, trackingContext(input, session, eventType, {
      organizationId: context.organization.id,
      contactId: context.contact.id,
      opportunityId: context.opportunity?.id ?? null,
      meetingType,
      startUtc: attemptedStart.isValid ? attemptedStart.toUTC().toISO() : null,
      ...options,
    }));
  await bookTrace("booking_submitted");
  const existing = meetingForType(context, meetingType);

  if (existing) {
    await bookTrace("booking_confirmed", {
      failureStage: "already_booked",
      calendarEventId: existing.external_event_id,
      httpStatus: 200,
    });
    return json({
      booked: true,
      alreadyBooked: true,
      booking: serializeBooking(existing, meetingType),
      contact: {
        name: displayName(context.contact),
        email: session.email,
      },
      organization: {
        id: context.organization.id,
        name: context.organization.name,
      },
    });
  }

  const startUtc = String(input.startUtc ?? "");
  const parsedStart = DateTime.fromISO(startUtc, { zone: "utc" });
  if (!parsedStart.isValid) {
    await bookTrace("booking_failed", {
      failureStage: "validate_time", failureCode: "invalid_start", httpStatus: 400,
    });
    return json({ booked: false, error: "That time is invalid." }, 400);
  }

  const config = MEETING_CONFIG[meetingType];
  const start = parsedStart.setZone(CENTRAL_ZONE);
  const end = start.plus({ minutes: config.durationMinutes });

  if (!(await selectedSlotAvailable(admin, meetingType, start, end))) {
    console.warn("BTY booking rejected: selected_slot_unavailable", {
      meetingType, startUtc, organizationId: context.organization.id,
      phase: "initial_validation",
    });
    await bookTrace("booking_failed", {
      failureStage: "initial_validation", failureCode: "slot_unavailable",
      httpStatus: 409,
    });
    return json({
      booked: false, code: "slot_unavailable",
      error: "That time is no longer available. Please select a different time.",
    }, 409);
  }

  const connections = await relationshipCalendarConnections(admin);
  const infoConnection = connections.find(
    (row) => row.google_account_email === INFO_CALENDAR,
  );
  if (!infoConnection) {
    throw new Error("Calendar booking is temporarily unavailable.");
  }

  const reservationExternalId = `pending:${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const { data: reservation, error: reservationError } = await admin
    .from("relationship_meetings")
    .insert({
      tenant_id: TENANT_ID,
      opportunity_id: context.opportunity?.id ?? null,
      organization_id: context.organization.id,
      contact_id: context.contact.id,
      purpose: meetingPurpose(meetingType),
      connection_id: infoConnection.id,
      calendar_id: INFO_CALENDAR,
      external_event_id: reservationExternalId,
      ical_uid: null,
      starts_at: start.toUTC().toISO(),
      ends_at: end.toUTC().toISO(),
      event_status: "tentative",
      streamyard_url:
        meetingType === "bty_interview" ? STREAMYARD_URL : null,
      last_synced_at: now,
      metadata: {
        source: "bty_public_scheduler",
        meeting_type: meetingType,
        booking_state: "reserving",
        booked_by_email: session.email,
      },
    })
    .select("id")
    .single();

  if (reservationError) {
    if (reservationError.code === "23505") {
      console.warn("BTY booking rejected: reservation_conflict", {
        meetingType, startUtc, organizationId: context.organization.id,
        phase: "database_reservation", constraint: reservationError.message,
      });
      await bookTrace("booking_failed", {
        failureStage: "database_reservation", failureCode: "reservation_conflict",
        httpStatus: 409,
      });
      return json(
        {
          booked: false,
          error:
            meetingType === "pre_interview"
              ? "That pre-interview day or invitation is no longer available. Please choose another time."
              : "That day is no longer available. Please choose another day.",
          code: "reservation_conflict",
        },
        409,
      );
    }
    throw new Error(reservationError.message);
  }

  try {
    if (
      !(await selectedSlotAvailable(
        admin,
        meetingType,
        start,
        end,
        { meetingId: reservation.id },
      ))
    ) {
      console.warn("BTY booking rejected: slot_changed_after_reservation", {
        meetingType, startUtc, organizationId: context.organization.id,
        reservationId: reservation.id, phase: "post_reservation_recheck",
      });
      await admin.from("relationship_meetings").delete().eq("id", reservation.id);
      await bookTrace("booking_failed", {
        failureStage: "post_reservation_recheck",
        failureCode: "slot_changed_during_booking", httpStatus: 409,
      });
      return json({
        booked: false, code: "slot_changed_during_booking",
        error: "That time has just become unavailable. Please choose a different time.",
      }, 409);
    }

    const event = await createGoogleEvent(admin, {
      meetingType,
      start,
      end,
      guestName: displayName(context.contact),
      organizationName: String(context.organization.name),
      guestEmail: session.email,
      opportunityId: context.opportunity?.id ?? null,
      organizationId: context.organization.id,
    });

    const confirmedAt = new Date().toISOString();
    const meetingUrl =
      typeof event.schedulerMeetingUrl === "string"
        ? event.schedulerMeetingUrl
        : null;

    const { error: meetingUpdateError } = await admin
      .from("relationship_meetings")
      .update({
        external_event_id: String(event.id),
        ical_uid:
          typeof event.iCalUID === "string" ? event.iCalUID : null,
        event_status: "confirmed",
        last_synced_at: confirmedAt,
        metadata: {
          source: "bty_public_scheduler",
          meeting_type: meetingType,
          booking_state: "confirmed",
          booked_by_email: session.email,
          ...(meetingType === "pre_interview"
            ? { google_meet_url: meetingUrl }
            : {}),
          google_html_link:
            typeof event.htmlLink === "string" ? event.htmlLink : null,
        },
      })
      .eq("id", reservation.id);
    if (meetingUpdateError) {
      console.error("BTY scheduler meeting confirmation update failed", {
        reservationId: reservation.id,
        calendarEventId: event.id,
        error: meetingUpdateError,
      });
      // Google already accepted the invitation; never tell the guest to retry
      // and accidentally create a duplicate. Preserve the event ID for repair.
      await admin.from("relationship_meetings").update({
        external_event_id: String(event.id),
        metadata: {
          source: "bty_public_scheduler",
          meeting_type: meetingType,
          booking_state: "calendar_created_crm_sync_pending",
          booked_by_email: session.email,
        },
      }).eq("id", reservation.id);
    } else {
      // CRM changes happen only after Google Calendar + booking DB confirm.
      // Errors are logged without turning an already-sent invite into a
      // misleading failed-booking response.
      // Capture the pre-booking CRM state first so a later release can
      // restore it exactly (the snapshot never fails the booking).
      let rollbackBase: Awaited<ReturnType<typeof captureRollbackSnapshot>> = null;
      try {
        rollbackBase = await captureRollbackSnapshot(admin, context, reservation.id);
      } catch (snapshotError) {
        console.error("BTY booking rollback snapshot capture failed", {
          reservationId: reservation.id,
          error: snapshotError instanceof Error ? snapshotError.message : String(snapshotError),
        });
      }
      let opportunityCreated = false;
      try {
        const reconciled = await reconcileConfirmedBooking(
          admin, context, reservation.id, meetingType,
          start.toUTC().toISO()!, String(event.id),
        );
        opportunityCreated = reconciled.opportunityCreated;
      } catch (syncError) {
        console.error("BTY booking CRM reconciliation exception", {
          reservationId: reservation.id,
          error: syncError instanceof Error ? syncError.message : String(syncError),
        });
      }
      if (rollbackBase) {
        try {
          const { error: snapshotSaveError } = await admin
            .from("relationship_meetings")
            .update({
              scheduler_rollback: {
                version: 1,
                original: rollbackBase.original,
                opportunity_created:
                  rollbackBase.carriedForwardOpportunityCreated ?? opportunityCreated,
              },
            })
            .eq("id", reservation.id);
          if (snapshotSaveError) {
            console.error("BTY booking rollback snapshot save failed", {
              reservationId: reservation.id, error: snapshotSaveError,
            });
          }
        } catch (snapshotError) {
          console.error("BTY booking rollback snapshot save exception", {
            reservationId: reservation.id,
            error: snapshotError instanceof Error ? snapshotError.message : String(snapshotError),
          });
        }
      }
    }

    const { data: linkedMeeting } = await admin.from("relationship_meetings")
      .select("opportunity_id").eq("id", reservation.id).maybeSingle();
    await bookTrace("booking_confirmed", {
      calendarEventId: String(event.id),
      opportunityId: linkedMeeting?.opportunity_id ?? context.opportunity?.id ?? null,
      failureStage: meetingUpdateError ? "calendar_created_db_update_pending" : null,
      httpStatus: 200,
    });
    if (meetingUpdateError || !linkedMeeting?.opportunity_id) {
      await bookTrace("booking_crm_sync_warning", {
        calendarEventId: String(event.id),
        failureStage: "crm_sync",
        failureCode: meetingUpdateError ? "meeting_confirmation_update" : "opportunity_link_missing",
      });
    }
    return json({
      booked: true,
      booking: {
        meetingType,
        startUtc: start.toUTC().toISO(),
        endUtc: end.toUTC().toISO(),
        meetingUrl:
          meetingType === "bty_interview"
            ? STREAMYARD_URL
            : meetingUrl,
        streamyardUrl:
          meetingType === "bty_interview" ? STREAMYARD_URL : null,
        calendarEventId: event.id,
        canChange: start.toUTC() > DateTime.utc(),
      },
      contact: {
        name: displayName(context.contact),
        email: session.email,
      },
      organization: {
        id: context.organization.id,
        name: context.organization.name,
      },
    });
  } catch (error) {
    await admin
      .from("relationship_meetings")
      .delete()
      .eq("id", reservation.id)
      .eq("external_event_id", reservationExternalId);
    await bookTrace("booking_failed", {
      failureStage: "calendar_or_reservation",
      failureCode: "unexpected_booking_error", httpStatus: 500,
    });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// In-place reschedule: same relationship_meetings row, same Google event.
// ---------------------------------------------------------------------------

type ReschedulableMeeting = ReleasableMeeting & {
  ends_at?: string | null;
  opportunity_id?: string | null;
  event_status?: string | null;
  ical_uid?: string | null;
  decline_detected_at?: string | null;
  streamyard_url?: string | null;
};

const SCHEDULER_NEXT_ACTION: Record<MeetingType, string> = {
  pre_interview:
    "Attend confirmed Beyond The Yellow pre-interview; Google Calendar invitation sent.",
  bty_interview:
    "Attend confirmed Beyond The Yellow recording; StreamYard invitation sent.",
};

function reschedulableMeeting(
  meeting: Record<string, unknown> | null,
):
  | { ok: true; meeting: ReschedulableMeeting }
  | { ok: false; status: number; code: string; error: string } {
  if (!meeting) {
    return { ok: false, status: 404, code: "no_booking", error: "No appointment was found to change." };
  }
  const candidate = meeting as ReschedulableMeeting;
  if (!isSchedulerOwned(candidate) || !hasRealEventId(candidate.external_event_id) ||
      candidate.event_status !== "confirmed") {
    return {
      ok: false, status: 409, code: "not_reschedulable",
      error: "This appointment can't be changed here. Email info@valorwell.org and we'll help.",
    };
  }
  const start = DateTime.fromISO(String(candidate.starts_at ?? ""), { zone: "utc" });
  const end = DateTime.fromISO(String(candidate.ends_at ?? ""), { zone: "utc" });
  if (!start.isValid || !end.isValid || start <= DateTime.utc()) {
    return {
      ok: false, status: 409, code: "already_started",
      error: "This appointment has already started. Email info@valorwell.org and we'll help.",
    };
  }
  return { ok: true, meeting: candidate };
}

async function exclusionForMeeting(
  admin: SupabaseClient,
  meeting: ReschedulableMeeting,
): Promise<BookingExclusion> {
  const googleEventId = hasRealEventId(meeting.external_event_id)
    ? String(meeting.external_event_id)
    : null;
  let iCalUid = typeof meeting.ical_uid === "string" && meeting.ical_uid
    ? meeting.ical_uid
    : null;
  if (!iCalUid && googleEventId) {
    // Older rows may lack ical_uid; read it from the exact event id.
    try {
      const write = await calendarWriteAccess(admin);
      const event = await readGoogleEvent(write.accessToken, write.calendarId, googleEventId);
      iCalUid = typeof event?.iCalUID === "string" && event.iCalUID ? event.iCalUID : null;
    } catch (lookupError) {
      console.warn("BTY reschedule iCalUID lookup failed", {
        meetingId: meeting.id,
        error: lookupError instanceof Error ? lookupError.message : String(lookupError),
      });
    }
  }
  return { meetingId: meeting.id ?? null, googleEventId, iCalUid };
}

function isExternalGuest(attendee: NonNullable<CalendarEvent["attendees"]>[number]) {
  const email = normalizeEmail(attendee.email);
  return Boolean(email) && !attendee.organizer && !attendee.self &&
    !attendee.resource && email !== INFO_CALENDAR;
}

function sameInstant(a: string | undefined, b: DateTime) {
  if (!a) return false;
  const parsed = DateTime.fromISO(a);
  return parsed.isValid && parsed.toMillis() === b.toMillis();
}

async function handleReschedule(admin: SupabaseClient, input: Record<string, unknown>) {
  const meetingType = parseMeetingType(input.meetingType);
  if (!meetingType) {
    return json({ rescheduled: false, error: "A valid meeting type is required." }, 400);
  }
  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  const current = meetingForType(context, meetingType);
  const parsedStart = DateTime.fromISO(String(input.startUtc ?? ""), { zone: "utc" });

  const trace = (eventType: SchedulerTrackingEvent, more: Partial<TrackingDetails> = {}) =>
    recordSchedulerEvent(admin, trackingContext(input, session, eventType, {
      contactId: context.contact.id,
      organizationId: context.organization.id,
      opportunityId: context.opportunity?.id ?? null,
      meetingType,
      startUtc: parsedStart.isValid ? parsedStart.toUTC().toISO() : null,
      calendarEventId: (current?.external_event_id as string | null | undefined) ?? null,
      ...more,
    }));
  const fail = async (
    status: number,
    failureStage: string,
    code: string,
    error: string,
  ) => {
    await trace("booking_reschedule_failed", { failureStage, failureCode: code, httpStatus: status });
    return json({ rescheduled: false, code, error }, status);
  };
  const UNCERTAIN =
    "We couldn't confirm whether your appointment changed. Please check your calendar invitation or email info@valorwell.org and we'll help.";

  const check = reschedulableMeeting(current);
  if (!check.ok) return await fail(check.status, "authorize", check.code, check.error);
  const meeting = check.meeting;
  const oldStartIso = String(meeting.starts_at);
  const oldEndIso = String(meeting.ends_at);
  const previousStart = DateTime.fromISO(oldStartIso, { zone: "utc" });

  if (!parsedStart.isValid) {
    return await fail(400, "validate_time", "invalid_start", "That time is invalid.");
  }
  const config = MEETING_CONFIG[meetingType];
  const start = parsedStart.setZone(CENTRAL_ZONE);
  const end = start.plus({ minutes: config.durationMinutes });
  if (start.toMillis() === previousStart.toMillis()) {
    return await fail(400, "validate_time", "same_time", "That's already your current appointment time.");
  }
  const newStartIso = start.toUTC().toISO()!;
  const newEndIso = end.toUTC().toISO()!;

  const exclusion = await exclusionForMeeting(admin, meeting);
  if (!(await selectedSlotAvailable(admin, meetingType, start, end, exclusion))) {
    return await fail(409, "initial_validation", "slot_unavailable",
      "That time is no longer available.");
  }

  const write = await calendarWriteAccess(admin);
  const eventId = String(meeting.external_event_id);
  const eventUrl =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(write.calendarId)}/events/${encodeURIComponent(eventId)}`;
  const eventResponse = await fetch(eventUrl, {
    headers: { authorization: `Bearer ${write.accessToken}` },
  });
  if (eventResponse.status === 404 || eventResponse.status === 410) {
    await eventResponse.text().catch(() => "");
    return await fail(409, "calendar_read", "event_gone",
      "This appointment's calendar invitation no longer exists. Please email info@valorwell.org and we'll help.");
  }
  if (!eventResponse.ok) {
    console.error("BTY reschedule event read failed", { meetingId: meeting.id, status: eventResponse.status });
    await eventResponse.text().catch(() => "");
    return await fail(502, "calendar_read", "calendar_read_failed",
      "We couldn't reach the calendar.");
  }
  const event = await eventResponse.json() as CalendarEvent;
  if (event.status === "cancelled") {
    return await fail(409, "calendar_read", "event_gone",
      "This appointment's calendar invitation no longer exists. Please email info@valorwell.org and we'll help.");
  }

  // Move the SAME row in place, guarded on its current times so a concurrent
  // release or move is never overwritten.
  const { data: moved, error: moveError } = await admin
    .from("relationship_meetings")
    .update({
      starts_at: newStartIso,
      ends_at: newEndIso,
      decline_detected_at: null,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", meeting.id)
    .eq("tenant_id", TENANT_ID)
    .eq("starts_at", oldStartIso)
    .eq("event_status", "confirmed")
    .select("id")
    .maybeSingle();
  if (moveError) {
    if (moveError.code === "23505") {
      return await fail(409, "database_reservation", "reservation_conflict",
        "That time is no longer available.");
    }
    throw new Error(moveError.message);
  }
  if (!moved) {
    return await fail(409, "database_reservation", "booking_changed",
      "Your appointment changed while we were updating it. Please refresh this page to see its current status.");
  }

  // Restore the row only if it still holds the new times we wrote.
  const restore = async () => {
    try {
      const { data, error } = await admin
        .from("relationship_meetings")
        .update({
          starts_at: oldStartIso,
          ends_at: oldEndIso,
          decline_detected_at: meeting.decline_detected_at ?? null,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", meeting.id)
        .eq("starts_at", newStartIso)
        .select("id")
        .maybeSingle();
      if (error) console.error("BTY reschedule rollback failed", { meetingId: meeting.id, error });
      return !error && Boolean(data);
    } catch (rollbackError) {
      console.error("BTY reschedule rollback exception", {
        meetingId: meeting.id,
        error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
      });
      return false;
    }
  };
  const failAfterMove = async (status: number, stage: string, code: string, error: string) => {
    if (await restore()) return await fail(status, stage, code, error);
    return await fail(409, stage, "state_uncertain", UNCERTAIN);
  };

  let patched: CalendarEvent;
  try {
    if (!(await selectedSlotAvailable(admin, meetingType, start, end, exclusion))) {
      return await failAfterMove(409, "post_reservation_recheck", "slot_changed_during_booking",
        "That time just became unavailable.");
    }

    const patchBody: Record<string, unknown> = {
      start: { dateTime: start.toISO(), timeZone: CENTRAL_ZONE },
      end: { dateTime: end.toISO(), timeZone: CENTRAL_ZONE },
    };
    if (Array.isArray(event.attendees)) {
      // Guests are re-marked accepted so a stale pre-move "declined" RSVP
      // cannot trigger the decline sweep. Organizer/self/resources unchanged.
      patchBody.attendees = event.attendees.map((attendee) =>
        isExternalGuest(attendee) ? { ...attendee, responseStatus: "accepted" } : attendee
      );
    }

    let patchResult: CalendarEvent | null = null;
    try {
      const patchResponse = await fetch(`${eventUrl}?sendUpdates=all`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${write.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(patchBody),
      });
      if (patchResponse.ok) {
        patchResult = await patchResponse.json().catch(() => ({})) as CalendarEvent;
      } else {
        console.error("BTY reschedule Google PATCH failed", {
          meetingId: meeting.id, status: patchResponse.status,
          body: await patchResponse.text().catch(() => ""),
        });
      }
    } catch (patchError) {
      // The request may or may not have reached Google; read back to decide.
      console.error("BTY reschedule Google PATCH exception", {
        meetingId: meeting.id,
        error: patchError instanceof Error ? patchError.message : String(patchError),
      });
      const readBack = await readGoogleEvent(write.accessToken, write.calendarId, eventId)
        .catch(() => null);
      if (readBack && sameInstant(readBack.start?.dateTime, start)) patchResult = readBack;
    }
    if (!patchResult) {
      return await failAfterMove(502, "calendar_update", "calendar_update_failed",
        "We couldn't update the calendar invitation.");
    }
    patched = patchResult;
  } catch (unexpected) {
    console.error("BTY reschedule unexpected error after move", {
      meetingId: meeting.id,
      error: unexpected instanceof Error ? unexpected.message : String(unexpected),
    });
    return await failAfterMove(502, "calendar_update", "unexpected_reschedule_error",
      "We couldn't move your appointment.");
  }

  // If Google kept every guest "declined", fingerprint this exact event
  // version so the sweep ignores the stale RSVPs until anything changes.
  const patchedGuests = (patched.attendees ?? []).filter(isExternalGuest);
  if (
    patchedGuests.length > 0 &&
    patchedGuests.every((guest) => guest.responseStatus === "declined") &&
    typeof patched.updated === "string"
  ) {
    const { error: guardError } = await admin.from("relationship_meetings")
      .update({
        metadata: {
          ...(meeting.metadata ?? {}),
          reschedule_rsvp_guard: { event_updated: patched.updated, set_at: new Date().toISOString() },
        },
      })
      .eq("id", meeting.id);
    if (guardError) console.error("BTY reschedule RSVP guard save failed", { meetingId: meeting.id, guardError });
  }

  // CRM: only scheduler-owned due dates and the booking snapshot start time.
  const nextAction = SCHEDULER_NEXT_ACTION[meetingType];
  let crmWarning: string | null = null;
  const opportunityId = meeting.opportunity_id ?? context.opportunity?.id ?? null;
  if (opportunityId) {
    const { data: fresh, error: freshError } = await admin
      .from("relationship_opportunities")
      .select("id,version,next_action,metadata")
      .eq("id", opportunityId)
      .eq("organization_id", context.organization.id)
      .maybeSingle();
    if (freshError || !fresh) {
      crmWarning = "opportunity_lookup";
    } else {
      const updates: Record<string, unknown> = {};
      if (fresh.next_action === nextAction) updates.next_action_due_at = newStartIso;
      const metadata = (fresh.metadata ?? {}) as Record<string, unknown>;
      const snapshot = metadata.bty_scheduler_booking as Record<string, unknown> | undefined;
      if (snapshot && snapshot.meeting_id === meeting.id) {
        updates.metadata = {
          ...metadata,
          bty_scheduler_booking: { ...snapshot, start_utc: newStartIso },
        };
      }
      if (Object.keys(updates).length) {
        const { data: updated, error: updateError } = await admin
          .from("relationship_opportunities")
          .update(updates)
          .eq("id", fresh.id)
          .eq("version", fresh.version)
          .select("id")
          .maybeSingle();
        if (updateError || !updated) crmWarning = "opportunity_update";
      }
    }
  }
  const { error: orgError } = await admin
    .from("relationship_organizations")
    .update({ next_action_due_at: newStartIso })
    .eq("id", context.organization.id)
    .eq("next_action", nextAction);
  if (orgError) crmWarning = crmWarning ?? "organization_update";
  if (crmWarning) {
    console.error("BTY reschedule CRM sync warning", { meetingId: meeting.id, crmWarning });
    await trace("booking_crm_sync_warning", {
      failureStage: "reschedule_crm_sync", failureCode: crmWarning, calendarEventId: eventId,
    });
  }

  await trace("booking_rescheduled", {
    startUtc: newStartIso, calendarEventId: eventId, httpStatus: 200,
  });
  return json({
    rescheduled: true,
    previousStartUtc: oldStartIso,
    booking: serializeBooking(
      { ...meeting, starts_at: newStartIso, ends_at: newEndIso },
      meetingType,
    ),
  });
}


Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const input = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(input.action ?? "");
    const admin = adminClient();

    if (action === "track") return await handleTrack(request, admin, input);
    if (action === "validate") return await handleValidate(request, admin, input);
    if (action === "availability") return await handleAvailability(admin, input);
    if (action === "book") {
      try {
        return await handleBook(admin, input);
      } catch (error) {
        // Covers errors that happen before the reservation try/catch above.
        try {
          const session = await verifySession(input.sessionToken);
          await recordSchedulerEvent(admin, trackingContext(input, session, "booking_failed", {
            meetingType: parseMeetingType(input.meetingType),
            startUtc: DateTime.fromISO(String(input.startUtc ?? ""), { zone: "utc" }).isValid
              ? DateTime.fromISO(String(input.startUtc), { zone: "utc" }).toISO()
              : null,
            failureStage: "unhandled_exception",
            failureCode: "server_exception",
            httpStatus: 500,
          }));
        } catch {
          // Do not change the original error, even if telemetry also fails.
        }
        throw error;
      }
    }

    if (action === "release") return await handleRelease(admin, input);
    if (action === "reschedule") return await handleReschedule(admin, input);
    if (action === "sweep_declines") return await handleSweepDeclines(request, admin);

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("BTY scheduler error", { message });
    const status =
      /session|invitation/i.test(message) ? 401 : 500;
    return json({ error: message }, status);
  }
});
