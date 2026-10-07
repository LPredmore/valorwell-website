import { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquare,
  Video,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { billingHubSupabase } from "@/integrations/supabase/client";

const CENTRAL_ZONE = "America/Chicago";
const STREAMYARD_URL = "https://streamyard.com/frr4zf8e3s";

type MeetingType = "pre_interview" | "bty_interview";

type Identity = {
  contact: { name: string; email: string };
  organization: { id: string; name: string };
};

type SchedulerSlot = {
  startUtc: string;
  endUtc: string;
};

type SchedulerDay = {
  date: string;
  slots: SchedulerSlot[];
};

type Booking = {
  meetingType: MeetingType;
  startUtc: string;
  endUtc: string;
  meetingUrl: string | null;
  streamyardUrl: string | null;
  calendarEventId?: string | null;
};

type BookingSet = {
  preInterview: Booking | null;
  btyInterview: Booking | null;
};

type ValidateResponse = Partial<Identity> & {
  eligible: boolean;
  state?: "ready";
  sessionToken?: string;
  bookings?: BookingSet;
};

type AvailabilityResponse = {
  state: "ready";
  meetingType: MeetingType;
  timezone: string;
  firstBookableDate: string;
  lastBookableDate: string;
  days: SchedulerDay[];
};

type BookResponse = Partial<Identity> & {
  booked: boolean;
  alreadyBooked?: boolean;
  booking?: Booking;
  error?: string;
};

const EMPTY_BOOKINGS: BookingSet = {
  preInterview: null,
  btyInterview: null,
};

const meetingTypeContent: Record<
  MeetingType,
  {
    title: string;
    shortTitle: string;
    description: string;
    duration: string;
  }
> = {
  pre_interview: {
    title: "Pre-Interview",
    shortTitle: "Pre-Interview",
    description:
      "Schedule a brief conversation with ValorWell before your Beyond The Yellow interview.",
    duration: "30 minutes",
  },
  bty_interview: {
    title: "Beyond The Yellow Interview",
    shortTitle: "BTY Interview",
    description:
      "Schedule your full Beyond The Yellow recorded conversation.",
    duration: "60 minutes",
  },
};

async function invokeScheduler<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await billingHubSupabase.functions.invoke(
    "bty-scheduler",
    { body },
  );
  if (error) {
    throw new Error(
      "The scheduler could not complete that request. Please try again.",
    );
  }
  return data as T;
}

function centralDateLabel(startUtc: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(startUtc));
}

function centralTimeLabel(startUtc: string) {
  return `${new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startUtc))} Central Time`;
}

function localTimeLabel(startUtc: string, localZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: localZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(startUtc));
}

function dateOnlyToUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function utcToDateOnly(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date: string, amount: number) {
  const next = dateOnlyToUtc(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return utcToDateOnly(next);
}

function buildWeekStarts(firstDate: string, lastDate: string) {
  if (!firstDate || !lastDate) return [];
  const starts: string[] = [];
  for (
    let current = firstDate;
    current <= lastDate;
    current = addDays(current, 7)
  ) {
    starts.push(current);
  }
  return starts;
}

function weekRangeLabel(weekStart: string) {
  const start = dateOnlyToUtc(weekStart);
  const end = dateOnlyToUtc(addDays(weekStart, 4));
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();

  const month = new Intl.DateTimeFormat("en-US", {
    month: sameMonth ? "long" : "short",
    timeZone: "UTC",
  }).format(start);
  const startDay = start.getUTCDate();

  if (sameMonth) {
    return `${month} ${startDay}–${end.getUTCDate()}`;
  }

  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(end);
  return `${month} ${startDay} – ${endLabel}`;
}

function dayHeader(date: string) {
  const value = dateOnlyToUtc(date);
  return {
    weekday: new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }).format(value),
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(value),
  };
}

function minutesLabel(minutes: number) {
  const date = new Date(
    Date.UTC(2026, 0, 1, Math.floor(minutes / 60), minutes % 60),
  );
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function centralStartMinutes(startUtc: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(startUtc));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? -1);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? -1,
  );
  return hour >= 0 && minute >= 0 ? hour * 60 + minute : -1;
}

function slotRowsForType(meetingType: MeetingType) {
  const step = meetingType === "pre_interview" ? 30 : 60;
  const duration = meetingType === "pre_interview" ? 30 : 60;
  const rows: number[] = [];
  for (let minutes = 9 * 60; minutes + duration <= 14 * 60; minutes += step) {
    rows.push(minutes);
  }
  return rows;
}

function bookingForType(bookings: BookingSet, meetingType: MeetingType) {
  return meetingType === "pre_interview"
    ? bookings.preInterview
    : bookings.btyInterview;
}

function SchedulerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-[#F4F1E8] text-[#111814]">
      <div className="container-wide py-10 md:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}

export default function BtySchedulerPage() {
  const localZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : CENTRAL_ZONE;

  const [email, setEmail] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [bookings, setBookings] = useState<BookingSet>(EMPTY_BOOKINGS);
  const [meetingType, setMeetingType] = useState<MeetingType | null>(null);
  const [days, setDays] = useState<SchedulerDay[]>([]);
  const [weekStarts, setWeekStarts] = useState<string[]>([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SchedulerSlot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checking, setChecking] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingNow, setBookingNow] = useState(false);
  const [error, setError] = useState("");

  const currentWeekStart = weekStarts[weekIndex] ?? "";

  const currentWeekDates = useMemo(
    () =>
      currentWeekStart
        ? Array.from({ length: 5 }, (_, index) =>
            addDays(currentWeekStart, index),
          )
        : [],
    [currentWeekStart],
  );

  const slotRows = useMemo(
    () => (meetingType ? slotRowsForType(meetingType) : []),
    [meetingType],
  );

  const slotByDateMinutes = useMemo(() => {
    const slots = new Map<string, SchedulerSlot>();
    for (const day of days) {
      for (const slot of day.slots) {
        slots.set(
          `${day.date}|${centralStartMinutes(slot.startUtc)}`,
          slot,
        );
      }
    }
    return slots;
  }, [days]);

  function clearCalendarState() {
    setDays([]);
    setWeekStarts([]);
    setWeekIndex(0);
    setSelectedSlot(null);
  }

  async function loadAvailability(
    token: string,
    type: MeetingType,
    preferredWeekStart?: string,
  ) {
    setLoadingAvailability(true);
    setError("");
    try {
      const result = await invokeScheduler<AvailabilityResponse>({
        action: "availability",
        sessionToken: token,
        meetingType: type,
      });
      const nextDays = result.days ?? [];
      const nextWeeks = buildWeekStarts(
        result.firstBookableDate,
        result.lastBookableDate,
      );

      setDays(nextDays);
      setWeekStarts(nextWeeks);
      const preferredIndex = preferredWeekStart
        ? nextWeeks.indexOf(preferredWeekStart)
        : -1;
      setWeekIndex(preferredIndex >= 0 ? preferredIndex : 0);
      setSelectedSlot(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Availability could not be loaded.",
      );
    } finally {
      setLoadingAvailability(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    setError("");
    setBooking(null);
    setMeetingType(null);
    setBookings(EMPTY_BOOKINGS);
    clearCalendarState();

    try {
      const result = await invokeScheduler<ValidateResponse>({
        action: "validate",
        email: email.trim(),
      });

      if (!result.eligible || !result.contact || !result.organization) {
        setIdentity(null);
        setSessionToken("");
        setError(
          "We couldn't match that email to an active Beyond The Yellow scheduling invitation. Use the email address associated with the organization we contacted.",
        );
        return;
      }

      setIdentity({
        contact: result.contact,
        organization: result.organization,
      });
      setBookings(result.bookings ?? EMPTY_BOOKINGS);

      if (!result.sessionToken) {
        throw new Error("The scheduling invitation could not be opened.");
      }

      setSessionToken(result.sessionToken);
    } catch (requestError) {
      setIdentity(null);
      setSessionToken("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The scheduler is temporarily unavailable.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function chooseMeetingType(type: MeetingType) {
    setMeetingType(type);
    setError("");
    clearCalendarState();

    const existing = bookingForType(bookings, type);
    if (existing) {
      setBooking(existing);
      return;
    }

    setBooking(null);
    if (sessionToken) {
      await loadAvailability(sessionToken, type);
    }
  }

  async function handleBook() {
    if (!sessionToken || !selectedSlot || !meetingType) return;
    setBookingNow(true);
    setError("");
    const weekToPreserve = currentWeekStart;

    try {
      const result = await invokeScheduler<BookResponse>({
        action: "book",
        sessionToken,
        meetingType,
        startUtc: selectedSlot.startUtc,
      });
      if (!result.booked || !result.booking) {
        setSelectedSlot(null);
        setError(
          result.error ||
            "That time could not be booked. Please choose another time.",
        );
        await loadAvailability(sessionToken, meetingType, weekToPreserve);
        return;
      }

      if (result.contact && result.organization) {
        setIdentity({
          contact: result.contact,
          organization: result.organization,
        });
      }

      const confirmedBooking = result.booking;
      setBookings((current) =>
        confirmedBooking.meetingType === "pre_interview"
          ? { ...current, preInterview: confirmedBooking }
          : { ...current, btyInterview: confirmedBooking },
      );
      setBooking(confirmedBooking);
      clearCalendarState();
    } catch (requestError) {
      setSelectedSlot(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "That time could not be booked.",
      );
      await loadAvailability(sessionToken, meetingType, weekToPreserve);
    } finally {
      setBookingNow(false);
    }
  }

  const reset = () => {
    setIdentity(null);
    setSessionToken("");
    setBookings(EMPTY_BOOKINGS);
    setMeetingType(null);
    setBooking(null);
    clearCalendarState();
    setError("");
  };

  const backToMeetingTypes = () => {
    setMeetingType(null);
    setBooking(null);
    clearCalendarState();
    setError("");
  };

  return (
    <Layout>
      <SEO
        title="Schedule Beyond The Yellow"
        description="Private scheduling page for invited Beyond The Yellow guests."
        canonical="/beyond-the-yellow/schedule"
        noIndex
      />

      <SchedulerShell>
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">
            Beyond The Yellow
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Schedule your conversation.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#111814]/70 md:text-lg">
            This private scheduler is for organizations already invited to a
            Beyond The Yellow conversation. Enter the email address associated
            with your organization to continue.
          </p>
        </div>

        {!identity && (
          <section className="mx-auto max-w-xl rounded-3xl border border-[#3B5147]/15 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-[#3B5147]/10 p-3 text-[#3B5147]">
                <LockKeyhole className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Verify your invitation</h2>
                <p className="mt-1 leading-6 text-[#111814]/65">
                  No account or password is required.
                </p>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit}>
              <label
                htmlFor="bty-scheduler-email"
                className="text-sm font-bold text-[#111814]"
              >
                Email address
              </label>
              <div className="relative mt-2">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3B5147]/70"
                  aria-hidden="true"
                />
                <input
                  id="bty-scheduler-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@organization.org"
                  className="min-h-12 w-full rounded-xl border border-[#3B5147]/20 bg-[#F4F1E8] py-3 pl-12 pr-4 text-base outline-none transition focus:border-[#3B5147] focus:ring-2 focus:ring-[#3B5147]/20"
                />
              </div>
              <button
                type="submit"
                disabled={checking}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B5147] px-5 py-3 font-bold text-white transition hover:bg-[#30443b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checking ? (
                  <>
                    <Loader2
                      className="h-5 w-5 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Checking invitation
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </section>
        )}

        {identity && (
          <div>
            <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-[#3B5147]/15 bg-[#3B5147] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4F1E8]/70">
                  Scheduling for
                </p>
                <h2 className="mt-2 text-xl font-bold md:text-2xl">
                  {identity.organization.name}
                </h2>
                <p className="mt-1 text-sm text-white/75 md:text-base">
                  {identity.contact.name} · {identity.contact.email}
                </p>
              </div>

              <button
                type="button"
                onClick={reset}
                className="min-h-11 shrink-0 rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Use a different email
              </button>
            </section>

            {!meetingType && (
              <section className="rounded-3xl border border-[#3B5147]/15 bg-white p-5 shadow-sm sm:p-6 md:p-8">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                    Choose a meeting
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    What would you like to schedule?
                  </h2>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {(
                    ["pre_interview", "bty_interview"] as MeetingType[]
                  ).map((type) => {
                    const copy = meetingTypeContent[type];
                    const existing = bookingForType(bookings, type);
                    const Icon =
                      type === "pre_interview" ? MessageSquare : Video;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => void chooseMeetingType(type)}
                        className="group rounded-2xl border border-[#3B5147]/15 bg-[#F8F6F0] p-5 text-left transition hover:border-[#3B5147]/45 hover:bg-[#F4F1E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 md:p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="rounded-xl bg-[#3B5147]/10 p-3 text-[#3B5147]">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          {existing && (
                            <span className="rounded-full bg-[#3B5147] px-3 py-1 text-xs font-bold text-white">
                              Scheduled
                            </span>
                          )}
                        </div>
                        <h3 className="mt-5 text-xl font-bold">{copy.title}</h3>
                        <p className="mt-2 text-sm font-bold text-[#3B5147]/70">
                          {copy.duration}
                        </p>
                        <p className="mt-3 leading-6 text-[#111814]/65">
                          {copy.description}
                        </p>
                        {existing && (
                          <p className="mt-4 text-sm font-bold text-[#3B5147]">
                            {centralDateLabel(existing.startUtc)} ·{" "}
                            {centralTimeLabel(existing.startUtc)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {meetingType && booking && (
              <section className="mx-auto max-w-2xl rounded-3xl border border-[#3B5147]/15 bg-white p-6 shadow-sm md:p-9">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[#3B5147]/10 p-3 text-[#3B5147]">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#3B5147]">
                      {meetingTypeContent[meetingType].shortTitle} scheduled
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {identity.organization.name}
                    </h2>
                    <p className="mt-2 text-[#111814]/65">
                      {identity.contact.name} · {identity.contact.email}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-4 rounded-2xl bg-[#F4F1E8] p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#3B5147]">
                      Date
                    </p>
                    <p className="mt-2 font-bold">
                      {centralDateLabel(booking.startUtc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#3B5147]">
                      Time
                    </p>
                    <p className="mt-2 font-bold">
                      {centralTimeLabel(booking.startUtc)}
                    </p>
                    {localZone !== CENTRAL_ZONE && (
                      <p className="mt-1 text-sm text-[#111814]/60">
                        {localTimeLabel(booking.startUtc, localZone)} in your
                        local timezone
                      </p>
                    )}
                  </div>
                </div>

                {meetingType === "bty_interview" ? (
                  <div className="mt-6 rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
                    <div className="flex gap-3">
                      <Video
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#3B5147]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-bold">StreamYard recording room</p>
                        <a
                          href={
                            booking.streamyardUrl ||
                            booking.meetingUrl ||
                            STREAMYARD_URL
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block break-all font-bold text-[#3B5147] underline underline-offset-4"
                        >
                          {booking.streamyardUrl ||
                            booking.meetingUrl ||
                            STREAMYARD_URL}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
                    <div className="flex gap-3">
                      <Video
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#3B5147]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-bold">Google Meet</p>
                        {booking.meetingUrl ? (
                          <a
                            href={booking.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block break-all font-bold text-[#3B5147] underline underline-offset-4"
                          >
                            Join Google Meet
                          </a>
                        ) : (
                          <p className="mt-2 text-sm leading-6 text-[#111814]/65">
                            Your Google Meet link is included in the calendar
                            invitation.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-6 leading-7 text-[#111814]/65">
                  A Google Calendar invitation is sent to the email address used
                  for this booking.
                </p>

                <button
                  type="button"
                  onClick={backToMeetingTypes}
                  className="mt-6 min-h-11 rounded-xl border border-[#3B5147]/25 px-4 py-2 text-sm font-bold text-[#3B5147] transition hover:bg-[#3B5147]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147]"
                >
                  Back to scheduling options
                </button>
              </section>
            )}

            {meetingType && !booking && (
              <section className="rounded-3xl border border-[#3B5147]/15 bg-white p-4 shadow-sm sm:p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={backToMeetingTypes}
                      className="mb-4 inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#3B5147]/15 px-3 py-2 text-sm font-bold text-[#3B5147] transition hover:bg-[#3B5147]/5"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Meeting options
                    </button>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                      {meetingTypeContent[meetingType].shortTitle}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      Available times
                    </h2>
                  </div>
                  <p className="text-sm font-medium text-[#111814]/55">
                    Central Time
                  </p>
                </div>

                {loadingAvailability ? (
                  <div className="flex min-h-72 items-center justify-center gap-3 text-[#3B5147]">
                    <Loader2
                      className="h-6 w-6 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span className="font-bold">Checking calendars</span>
                  </div>
                ) : weekStarts.length === 0 ? (
                  <div className="mt-8 rounded-2xl bg-[#F4F1E8] p-6">
                    <p className="font-bold">
                      No valid times are open right now.
                    </p>
                    <p className="mt-2 leading-6 text-[#111814]/65">
                      Email info@valorwell.org and we can coordinate a time
                      directly.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 rounded-2xl border border-[#3B5147]/15 bg-[#F8F6F0] p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWeekIndex((current) => Math.max(0, current - 1));
                            setSelectedSlot(null);
                            setError("");
                          }}
                          disabled={weekIndex === 0}
                          className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#3B5147]/15 bg-white px-3 py-2 text-sm font-bold text-[#3B5147] transition hover:border-[#3B5147]/40 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label="Previous week"
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="min-w-0 text-center">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]/65">
                            Week
                          </p>
                          <p className="mt-0.5 truncate text-base font-bold sm:text-lg">
                            {weekRangeLabel(currentWeekStart)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setWeekIndex((current) =>
                              Math.min(weekStarts.length - 1, current + 1),
                            );
                            setSelectedSlot(null);
                            setError("");
                          }}
                          disabled={weekIndex === weekStarts.length - 1}
                          className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#3B5147]/15 bg-white px-3 py-2 text-sm font-bold text-[#3B5147] transition hover:border-[#3B5147]/40 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label="Next week"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div
                        className="mt-3 flex gap-2 overflow-x-auto pb-1"
                        aria-label="Choose a week"
                      >
                        {weekStarts.map((weekStart, index) => {
                          const active = index === weekIndex;
                          return (
                            <button
                              key={weekStart}
                              type="button"
                              onClick={() => {
                                setWeekIndex(index);
                                setSelectedSlot(null);
                                setError("");
                              }}
                              className={`min-h-10 shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 ${
                                active
                                  ? "border-[#3B5147] bg-[#3B5147] text-white"
                                  : "border-[#3B5147]/15 bg-white text-[#3B5147] hover:border-[#3B5147]/40"
                              }`}
                            >
                              {weekRangeLabel(weekStart)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 overflow-x-auto rounded-2xl border border-[#3B5147]/15 bg-white">
                      <div className="min-w-[760px]">
                        <div className="grid grid-cols-[88px_repeat(5,minmax(132px,1fr))] border-b border-[#3B5147]/15 bg-[#F4F1E8]">
                          <div className="sticky left-0 z-20 flex min-h-16 items-center justify-center border-r border-[#3B5147]/15 bg-[#F4F1E8] px-2 text-xs font-bold uppercase tracking-[0.1em] text-[#3B5147]/65">
                            Central
                          </div>
                          {currentWeekDates.map((date) => {
                            const header = dayHeader(date);
                            return (
                              <div
                                key={date}
                                className="flex min-h-16 flex-col items-center justify-center border-r border-[#3B5147]/10 px-2 text-center last:border-r-0"
                              >
                                <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#3B5147]/65">
                                  {header.weekday}
                                </span>
                                <span className="mt-1 text-sm font-bold text-[#111814]">
                                  {header.date}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {slotRows.map((minutes) => (
                          <div
                            key={minutes}
                            className="grid grid-cols-[88px_repeat(5,minmax(132px,1fr))] border-b border-[#3B5147]/10 last:border-b-0"
                          >
                            <div className="sticky left-0 z-10 flex min-h-[72px] items-center justify-center border-r border-[#3B5147]/15 bg-[#F8F6F0] px-2 text-sm font-bold text-[#3B5147]">
                              {minutesLabel(minutes)}
                            </div>

                            {currentWeekDates.map((date) => {
                              const slot = slotByDateMinutes.get(
                                `${date}|${minutes}`,
                              );
                              const active =
                                Boolean(slot) &&
                                selectedSlot?.startUtc === slot?.startUtc;

                              if (!slot) {
                                return (
                                  <div
                                    key={date}
                                    className="flex min-h-[72px] items-center justify-center border-r border-[#3B5147]/10 bg-[#F8F6F0]/55 px-2 last:border-r-0"
                                    aria-label={`${dayHeader(date).weekday} ${minutesLabel(minutes)} unavailable`}
                                  >
                                    <span className="text-xs font-medium text-[#111814]/30">
                                      Unavailable
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={date}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSlot(slot);
                                    setError("");
                                  }}
                                  className={`min-h-[72px] border-r border-[#3B5147]/10 px-3 py-3 text-center transition last:border-r-0 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B5147] ${
                                    active
                                      ? "bg-[#D7A92E]/20"
                                      : "bg-white hover:bg-[#3B5147]/5"
                                  }`}
                                  aria-pressed={active}
                                >
                                  <span className="block text-sm font-bold text-[#3B5147]">
                                    {minutesLabel(minutes)}
                                  </span>
                                  <span className="mt-1 block text-xs font-medium text-[#111814]/55">
                                    Available
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedSlot && (
                      <div className="mt-5 rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#3B5147]">
                          Confirm {meetingTypeContent[meetingType].shortTitle}
                        </p>
                        <p className="mt-2 text-lg font-bold">
                          {centralDateLabel(selectedSlot.startUtc)} ·{" "}
                          {centralTimeLabel(selectedSlot.startUtc)}
                        </p>
                        {localZone !== CENTRAL_ZONE && (
                          <p className="mt-1 text-sm text-[#111814]/60">
                            {localTimeLabel(selectedSlot.startUtc, localZone)} in
                            your local timezone
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleBook}
                          disabled={bookingNow}
                          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B5147] px-5 py-3 font-bold text-white transition hover:bg-[#30443b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
                        >
                          {bookingNow ? (
                            <>
                              <Loader2
                                className="h-5 w-5 animate-spin motion-reduce:animate-none"
                                aria-hidden="true"
                              />
                              Booking
                            </>
                          ) : (
                            `Schedule ${meetingTypeContent[meetingType].shortTitle}`
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#B24A3A]/30 bg-[#B24A3A]/10 p-4 text-sm leading-6 text-[#6d2f27]"
          >
            {error}
          </div>
        )}
      </SchedulerShell>
    </Layout>
  );
}
