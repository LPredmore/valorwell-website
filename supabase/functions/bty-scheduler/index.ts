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
const SESSION_MINUTES = 60;
const SLOT_HOURS = [9, 10, 11, 12, 13];
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
  opportunityId: string;
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
};

type BusyEvent = {
  start: DateTime;
  end: DateTime;
  allDay: boolean;
  physical: boolean;
  isBty: boolean;
};

type ContactRecord = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
};

type OpportunityRecord = {
  id: string;
  organization_id: string;
  status: string;
  review_status: string;
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
    !payload.opportunityId ||
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

function schedulerEnabled(opportunity: OpportunityRecord) {
  return opportunity.metadata?.scheduler_enabled === true;
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

  const { data: opportunities, error: opportunityError } = await admin
    .from("relationship_opportunities")
    .select(
      "id,organization_id,status,review_status,qualification,metadata,updated_at",
    )
    .eq("tenant_id", TENANT_ID)
    .in("organization_id", organizationIds)
    .order("updated_at", { ascending: false });
  if (opportunityError) throw new Error(opportunityError.message);

  const btyOpportunities = ((opportunities ?? []) as OpportunityRecord[]).filter(
    isBtyOpportunity,
  );
  if (!btyOpportunities.length) return null;

  const opportunityIds = btyOpportunities.map((row) => row.id);
  const { data: meetings, error: meetingError } = await admin
    .from("relationship_meetings")
    .select(
      "id,opportunity_id,organization_id,contact_id,starts_at,ends_at,event_status,streamyard_url,external_event_id",
    )
    .eq("tenant_id", TENANT_ID)
    .eq("purpose", "bty_recording")
    .in("opportunity_id", opportunityIds)
    .in("event_status", ["tentative", "confirmed"])
    .order("starts_at", { ascending: true });
  if (meetingError) throw new Error(meetingError.message);

  const activeMeeting = (meetings ?? [])[0] ?? null;
  let opportunity: OpportunityRecord | undefined;
  if (activeMeeting) {
    opportunity = btyOpportunities.find(
      (row) => row.id === activeMeeting.opportunity_id,
    );
  } else {
    opportunity = btyOpportunities.find(schedulerEnabled);
  }
  if (!opportunity) return null;

  const { data: organization, error: organizationError } = await admin
    .from("relationship_organizations")
    .select("id,name")
    .eq("tenant_id", TENANT_ID)
    .eq("id", opportunity.organization_id)
    .maybeSingle();
  if (organizationError) throw new Error(organizationError.message);
  if (!organization) return null;

  return {
    contact,
    organization,
    opportunity,
    activeMeeting,
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
    context.organization.id !== session.organizationId ||
    context.opportunity.id !== session.opportunityId
  ) {
    throw new Error("This scheduling invitation is no longer active.");
  }
  if (context.activeMeeting) {
    return { ...context, state: "booked" as const };
  }
  if (!schedulerEnabled(context.opportunity)) {
    throw new Error("This scheduling invitation is no longer active.");
  }
  return { ...context, state: "ready" as const };
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
  const serialized = `${event.summary ?? ""} ${event.description ?? ""} ${location}`;
  return {
    ...bounds,
    physical: Boolean(location) && !isVirtualLocation(location),
    isBty:
      /beyond\s+the\s+yellow/i.test(String(event.summary ?? "")) ||
      serialized.includes(STREAMYARD_URL),
  };
}

async function collectBusyEvents(
  admin: SupabaseClient,
  rangeStart: DateTime,
  rangeEnd: DateTime,
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
  return busy;
}

function firstBookableMonday(now = DateTime.now().setZone(CENTRAL_ZONE)) {
  const threshold = now.startOf("day").plus({ days: 7 });
  return threshold.weekday === 1
    ? threshold
    : threshold.plus({ days: 8 - threshold.weekday }).startOf("day");
}

function slotConflicts(
  slotStart: DateTime,
  slotEnd: DateTime,
  event: BusyEvent,
) {
  const bufferHours = event.physical ? 2 : 1;
  const blockedStart = event.start.minus({ hours: bufferHours });
  const blockedEnd = event.end.plus({ hours: bufferHours });
  return slotStart < blockedEnd && slotEnd > blockedStart;
}

function centralDateKey(value: DateTime) {
  return value.setZone(CENTRAL_ZONE).toFormat("yyyy-MM-dd");
}

async function blockedMeetingDates(
  admin: SupabaseClient,
  rangeStart: DateTime,
  rangeEnd: DateTime,
) {
  const { data, error } = await admin
    .from("relationship_meetings")
    .select("starts_at")
    .eq("tenant_id", TENANT_ID)
    .eq("purpose", "bty_recording")
    .in("event_status", ["tentative", "confirmed"])
    .gte("starts_at", rangeStart.toUTC().toISO()!)
    .lt("starts_at", rangeEnd.toUTC().toISO()!);
  if (error) throw new Error(error.message);
  return new Set(
    (data ?? [])
      .map((row) => DateTime.fromISO(String(row.starts_at)))
      .filter((date) => date.isValid)
      .map(centralDateKey),
  );
}

async function computeAvailability(admin: SupabaseClient) {
  const firstDay = firstBookableMonday();
  const rangeEnd = firstDay.plus({ weeks: AVAILABILITY_WEEKS });
  const busy = await collectBusyEvents(
    admin,
    firstDay.minus({ hours: 3 }),
    rangeEnd.plus({ hours: 3 }),
  );
  const blockedByMeeting = await blockedMeetingDates(admin, firstDay, rangeEnd);
  const blockedBtyDates = new Set(blockedByMeeting);
  for (const event of busy) {
    if (event.isBty) blockedBtyDates.add(centralDateKey(event.start));
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
    if (blockedBtyDates.has(dateKey)) continue;
    const slots: Array<{ startUtc: string; endUtc: string }> = [];
    for (const hour of SLOT_HOURS) {
      const start = day.set({ hour, minute: 0, second: 0, millisecond: 0 });
      const end = start.plus({ minutes: SESSION_MINUTES });
      if (busy.some((event) => slotConflicts(start, end, event))) continue;
      slots.push({
        startUtc: start.toUTC().toISO()!,
        endUtc: end.toUTC().toISO()!,
      });
    }
    if (slots.length) days.push({ date: dateKey, slots });
  }

  return {
    timezone: CENTRAL_ZONE,
    firstBookableDate: firstDay.toFormat("yyyy-MM-dd"),
    lastBookableDate: rangeEnd.minus({ days: 1 }).toFormat("yyyy-MM-dd"),
    days,
  };
}

async function selectedSlotAvailable(
  admin: SupabaseClient,
  start: DateTime,
  end: DateTime,
) {
  const firstDay = firstBookableMonday();
  const finalDay = firstDay.plus({ weeks: AVAILABILITY_WEEKS });
  if (
    start < firstDay ||
    start >= finalDay ||
    start.weekday > 5 ||
    start.minute !== 0 ||
    start.second !== 0 ||
    !SLOT_HOURS.includes(start.hour)
  ) {
    return false;
  }
  const dayStart = start.startOf("day");
  const dayEnd = dayStart.plus({ days: 1 });

  const blocked = await blockedMeetingDates(admin, dayStart, dayEnd);
  if (blocked.has(centralDateKey(start))) return false;

  const busy = await collectBusyEvents(
    admin,
    dayStart.minus({ hours: 3 }),
    dayEnd.plus({ hours: 3 }),
  );
  if (
    busy.some(
      (event) =>
        event.isBty && centralDateKey(event.start) === centralDateKey(start),
    )
  ) {
    return false;
  }
  return !busy.some((event) => slotConflicts(start, end, event));
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

async function createGoogleEvent(
  admin: SupabaseClient,
  input: {
    start: DateTime;
    end: DateTime;
    guestName: string;
    organizationName: string;
    guestEmail: string;
    opportunityId: string;
  },
) {
  const write = await calendarWriteAccess(admin);
  const summary = input.guestName
    ? `Beyond The Yellow | ${input.guestName} | ${input.organizationName}`
    : `Beyond The Yellow | ${input.organizationName}`;
  const body = {
    summary,
    description:
      `Beyond The Yellow prerecorded conversation with ValorWell.\n\nJoin the recording: ${STREAMYARD_URL}\n\nScheduled in Central Time.`,
    location: STREAMYARD_URL,
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
        relationshipOpportunityId: input.opportunityId,
      },
    },
  };
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(write.calendarId)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${write.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const event = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || typeof event.id !== "string") {
    console.error("BTY scheduler Google event creation failed", {
      status: response.status,
      event,
    });
    throw new Error("The calendar invitation could not be created.");
  }
  return event;
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
  if (context.activeMeeting) {
    return json({
      eligible: true,
      state: "booked",
      contact: { name: contactName, email },
      organization: {
        id: context.organization.id,
        name: context.organization.name,
      },
      booking: {
        startUtc: context.activeMeeting.starts_at,
        endUtc: context.activeMeeting.ends_at,
        streamyardUrl: context.activeMeeting.streamyard_url,
      },
    });
  }
  if (!schedulerEnabled(context.opportunity)) return json({ eligible: false });

  const sessionToken = await issueSession({
    contactId: context.contact.id,
    organizationId: context.organization.id,
    opportunityId: context.opportunity.id,
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
  });
}

async function handleAvailability(
  admin: SupabaseClient,
  input: Record<string, unknown>,
) {
  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  if (context.state === "booked") {
    return json(
      {
        state: "booked",
        booking: {
          startUtc: context.activeMeeting.starts_at,
          endUtc: context.activeMeeting.ends_at,
          streamyardUrl: context.activeMeeting.streamyard_url,
        },
      },
      409,
    );
  }
  return json({ state: "ready", ...(await computeAvailability(admin)) });
}

async function handleBook(
  admin: SupabaseClient,
  input: Record<string, unknown>,
) {
  const session = await verifySession(input.sessionToken);
  const context = await revalidateSession(admin, session);
  if (context.state === "booked") {
    return json(
      {
        booked: true,
        alreadyBooked: true,
        booking: {
          startUtc: context.activeMeeting.starts_at,
          endUtc: context.activeMeeting.ends_at,
          streamyardUrl: context.activeMeeting.streamyard_url,
        },
      },
      200,
    );
  }

  const startUtc = String(input.startUtc ?? "");
  const parsedStart = DateTime.fromISO(startUtc, { zone: "utc" });
  if (!parsedStart.isValid) {
    return json({ booked: false, error: "That time is invalid." }, 400);
  }
  const start = parsedStart.setZone(CENTRAL_ZONE);
  const end = start.plus({ minutes: SESSION_MINUTES });
  if (!(await selectedSlotAvailable(admin, start, end))) {
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
      opportunity_id: context.opportunity.id,
      organization_id: context.organization.id,
      contact_id: context.contact.id,
      purpose: "bty_recording",
      connection_id: infoConnection.id,
      calendar_id: INFO_CALENDAR,
      external_event_id: reservationExternalId,
      ical_uid: null,
      starts_at: start.toUTC().toISO(),
      ends_at: end.toUTC().toISO(),
      event_status: "tentative",
      streamyard_url: STREAMYARD_URL,
      last_synced_at: now,
      metadata: {
        source: "bty_public_scheduler",
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
          error: "That day is no longer available. Please choose another day.",
        },
        409,
      );
    }
    throw new Error(reservationError.message);
  }

  try {
    // Recheck live Google calendars after the database reservation has locked the day.
    const dayStart = start.startOf("day");
    const busy = await collectBusyEvents(
      admin,
      dayStart.minus({ hours: 3 }),
      dayStart.plus({ days: 1, hours: 3 }),
    );
    const googleConflict =
      busy.some(
        (event) =>
          event.isBty && centralDateKey(event.start) === centralDateKey(start),
      ) || busy.some((event) => slotConflicts(start, end, event));
    if (googleConflict) {
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
      start,
      end,
      guestName: displayName(context.contact),
      organizationName: String(context.organization.name),
      guestEmail: session.email,
      opportunityId: context.opportunity.id,
    });

    const confirmedAt = new Date().toISOString();
    const { error: meetingUpdateError } = await admin
      .from("relationship_meetings")
      .update({
        external_event_id: String(event.id),
        ical_uid: typeof event.iCalUID === "string" ? event.iCalUID : null,
        event_status: "confirmed",
        last_synced_at: confirmedAt,
        metadata: {
          source: "bty_public_scheduler",
          booking_state: "confirmed",
          booked_by_email: session.email,
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

    const existingMetadata = context.opportunity.metadata ?? {};
    const { error: opportunityUpdateError } = await admin
      .from("relationship_opportunities")
      .update({
        metadata: {
          ...existingMetadata,
          scheduler_enabled: false,
          scheduler_booked_at: confirmedAt,
          scheduler_contact_id: context.contact.id,
          scheduler_calendar_event_id: String(event.id),
        },
      })
      .eq("tenant_id", TENANT_ID)
      .eq("id", context.opportunity.id);
    if (opportunityUpdateError) {
      console.error("BTY scheduler opportunity metadata update failed", {
        opportunityId: context.opportunity.id,
        error: opportunityUpdateError,
      });
    }

    return json({
      booked: true,
      booking: {
        startUtc: start.toUTC().toISO(),
        endUtc: end.toUTC().toISO(),
        streamyardUrl: STREAMYARD_URL,
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
