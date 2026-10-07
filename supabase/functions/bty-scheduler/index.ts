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
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  transparency?: string;
  eventType?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string }>;
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
};

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
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

type OpportunityRecord = {
  id: string;
  organization_id: string;
  qualification: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

const validateBuckets = new Map<string, { count: number; resetAt: number }>();

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
  meeting: Record<string, any> | null,
  meetingType: MeetingType,
) {
  if (!meeting) return null;
  const meetingUrl =
    meetingType === "bty_interview"
      ? meeting.streamyard_url ?? STREAMYARD_URL
      : meeting.meeting_url ??
        meeting.metadata?.google_meet_url ??
        null;
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
    .select("id,name,metadata,updated_at")
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
      "id,purpose,opportunity_id,organization_id,contact_id,starts_at,ends_at,event_status,streamyard_url,external_event_id,metadata",
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

  if (!btyInterview) {
    btyInterview = await findExistingCalendarBooking(
      admin,
      organization,
      email,
      "bty_interview",
    );
  }
  if (!preInterview) {
    preInterview = await findExistingCalendarBooking(
      admin,
      organization,
      email,
      "pre_interview",
    );
  }

  const { data: opportunities, error: opportunityError } = await admin
    .from("relationship_opportunities")
    .select("id,organization_id,qualification,metadata,updated_at")
    .eq("tenant_id", TENANT_ID)
    .eq("organization_id", organization.id)
    .order("updated_at", { ascending: false });
  if (opportunityError) throw new Error(opportunityError.message);
  const opportunity = ((opportunities ?? []) as OpportunityRecord[]).find(
    isBtyOpportunity,
  ) ?? null;

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
  return connections;
}

async function relationshipAccessToken(
  admin: SupabaseClient,
  connectionId: string,
) {
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
    throw new Error("Calendar availability is temporarily unavailable.");
  }
  return body.access_token;
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
  };
}

function comparableText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function findExistingCalendarBooking(
  admin: SupabaseClient,
  organization: OrganizationRecord,
  contactEmail: string,
  meetingType: MeetingType,
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

  for (const event of events) {
    const normalized = normalizeCalendarEvent(event);
    if (!normalized || normalized.end < now) continue;

    const typeMatches =
      meetingType === "pre_interview"
        ? normalized.isPreInterview
        : normalized.isBtyRecording;
    if (!typeMatches) continue;

    const attendeeEmails = (event.attendees ?? [])
      .map((attendee) => normalizeEmail(attendee.email))
      .filter(Boolean);
    const summary = comparableText(event.summary);
    const matchesEmail = attendeeEmails.includes(normalizedEmail);
    const matchesOrganization =
      organizationNeedle.length >= 4 && summary.includes(organizationNeedle);

    if (!matchesEmail && !matchesOrganization) continue;

    return {
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
      metadata: {},
    };
  }

  return null;
}

async function collectBusyEvents(
  admin: SupabaseClient,
  rangeStart: DateTime,
  rangeEnd: DateTime,
  excludeMeetingId?: string,
) {
  const connections = await relationshipCalendarConnections(admin);
  const busy: BusyEvent[] = [];
  for (const connection of connections) {
    const accessToken = await relationshipAccessToken(admin, connection.id);
    for (const calendarId of calendarsForAccount(connection.google_account_email)) {
      const events = await googleEvents(
        accessToken,
        calendarId,
        rangeStart.toUTC().toISO()!,
        rangeEnd.toUTC().toISO()!,
      );
      for (const event of events) {
        const normalized = normalizeCalendarEvent(event);
        if (normalized) busy.push(normalized);
      }
    }
  }

  let meetingsQuery = admin
    .from("relationship_meetings")
    .select("id,purpose,starts_at,ends_at,external_event_id")
    .eq("tenant_id", TENANT_ID)
    .in("purpose", ["bty_recording", "bty_preinterview"])
    .in("event_status", ["tentative", "confirmed"])
    .not("starts_at", "is", null)
    .not("ends_at", "is", null)
    .lt("starts_at", rangeEnd.toUTC().toISO()!)
    .gt("ends_at", rangeStart.toUTC().toISO()!);
  if (excludeMeetingId) {
    meetingsQuery = meetingsQuery.neq("id", excludeMeetingId);
  }
  const { data: meetings, error: meetingsError } = await meetingsQuery;
  if (meetingsError) throw new Error(meetingsError.message);

  for (const meeting of meetings ?? []) {
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
) {
  const { data, error } = await admin
    .from("relationship_meetings")
    .select("starts_at")
    .eq("tenant_id", TENANT_ID)
    .eq("purpose", purpose)
    .in("event_status", ["tentative", "confirmed"])
    .gte("starts_at", rangeStart.toUTC().toISO()!)
    .lt("starts_at", rangeEnd.toUTC().toISO()!);
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
) {
  const config = MEETING_CONFIG[meetingType];
  const firstDay = firstBookableMonday();
  const rangeEnd = firstDay.plus({ weeks: AVAILABILITY_WEEKS });
  const busy = await collectBusyEvents(
    admin,
    firstDay.minus({ hours: 3 }),
    rangeEnd.plus({ hours: 3 }),
  );
  const btyCounts = await activeMeetingCountsByDate(
    admin,
    "bty_recording",
    firstDay,
    rangeEnd,
  );
  const preCounts = await activeMeetingCountsByDate(
    admin,
    "bty_preinterview",
    firstDay,
    rangeEnd,
  );

  const blockedBtyDates = new Set(
    [...btyCounts.entries()]
      .filter(([, count]) => count >= 1)
      .map(([date]) => date),
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
      (preCounts.get(dateKey) ?? 0) >= 2
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
  excludeMeetingId?: string,
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
    return false;
  }

  const dayStart = start.startOf("day");
  const dayEnd = dayStart.plus({ days: 1 });
  const purpose = meetingPurpose(meetingType);
  const counts = await activeMeetingCountsByDate(
    admin,
    purpose,
    dayStart,
    dayEnd,
  );
  const count = counts.get(centralDateKey(start)) ?? 0;

  if (meetingType === "bty_interview" && count >= 1) return false;
  if (meetingType === "pre_interview" && count >= 2) return false;

  const busy = await collectBusyEvents(
    admin,
    dayStart.minus({ hours: 3 }),
    dayEnd.plus({ hours: 3 }),
    excludeMeetingId,
  );

  if (
    meetingType === "bty_interview" &&
    busy.some(
      (event) =>
        event.source === "google" &&
        event.isBtyRecording &&
        centralDateKey(event.start) === centralDateKey(start),
    )
  ) {
    return false;
  }

  return !busy.some((event) =>
    meetingTypeConflicts(meetingType, start, end, event)
  );
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
    await admin
      .from("staff_calendar_connections")
      .update({
        connection_status: "needs_reconnect",
        last_error: "BTY scheduler token refresh failed",
      })
      .eq("id", connection.id);
    throw new Error("Calendar booking is temporarily unavailable.");
  }
  return {
    accessToken: body.access_token,
    calendarId: connection.selected_calendar_id,
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
    return json({ eligible: false });
  }
  const context = await resolveContactContext(admin, email);
  if (!context) return json({ eligible: false });

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

  if (existing) {
    return json(
      {
        state: "booked",
        booking: serializeBooking(existing, meetingType),
      },
      409,
    );
  }

  return json({
    state: "ready",
    ...(await computeAvailability(admin, meetingType)),
  });
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
  const existing = meetingForType(context, meetingType);

  if (existing) {
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
    return json({ booked: false, error: "That time is invalid." }, 400);
  }

  const config = MEETING_CONFIG[meetingType];
  const start = parsedStart.setZone(CENTRAL_ZONE);
  const end = start.plus({ minutes: config.durationMinutes });

  if (!(await selectedSlotAvailable(admin, meetingType, start, end))) {
    return json(
      {
        booked: false,
        error: "That time is no longer available. Please choose another time.",
      },
      409,
    );
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
      return json(
        {
          booked: false,
          error:
            meetingType === "pre_interview"
              ? "That pre-interview day or invitation is no longer available. Please choose another time."
              : "That day is no longer available. Please choose another day.",
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
        reservation.id,
      ))
    ) {
      await admin.from("relationship_meetings").delete().eq("id", reservation.id);
      return json(
        {
          booked: false,
          error: "That time is no longer available. Please choose another time.",
        },
        409,
      );
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
        error: meetingUpdateError,
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
    throw error;
  }
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

    if (action === "validate") return await handleValidate(request, admin, input);
    if (action === "availability") return await handleAvailability(admin, input);
    if (action === "book") return await handleBook(admin, input);

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("BTY scheduler error", { message });
    const status =
      /session|invitation/i.test(message) ? 401 : 500;
    return json({ error: message }, status);
  }
});
