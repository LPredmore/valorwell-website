import { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Mail,
  Video,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { billingHubSupabase } from "@/integrations/supabase/client";

const CENTRAL_ZONE = "America/Chicago";
const STREAMYARD_URL = "https://streamyard.com/frr4zf8e3s";
const SLOT_HOURS = [9, 10, 11, 12, 13];

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
  startUtc: string;
  endUtc: string;
  streamyardUrl: string;
};

type ValidateResponse = Partial<Identity> & {
  eligible: boolean;
  state?: "ready" | "booked";
  sessionToken?: string;
  booking?: Booking;
};

type AvailabilityResponse = {
  state: "ready";
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

function hourLabel(hour: number) {
  const date = new Date(Date.UTC(2026, 0, 1, hour, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function centralStartHour(startUtc: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(startUtc));
  const hour = parts.find((part) => part.type === "hour")?.value;
  return hour ? Number(hour) : -1;
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

  const slotByDateHour = useMemo(() => {
    const slots = new Map<string, SchedulerSlot>();
    for (const day of days) {
      for (const slot of day.slots) {
        slots.set(
          `${day.date}|${centralStartHour(slot.startUtc)}`,
          slot,
        );
      }
    }
    return slots;
  }, [days]);

  async function loadAvailability(
    token: string,
    preferredWeekStart?: string,
  ) {
    setLoadingAvailability(true);
    setError("");
    try {
      const result = await invokeScheduler<AvailabilityResponse>({
        action: "availability",
        sessionToken: token,
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
    setDays([]);
    setWeekStarts([]);
    setWeekIndex(0);
    setSelectedSlot(null);

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

      if (result.state === "booked" && result.booking) {
        setBooking(result.booking);
        setSessionToken("");
        return;
      }

      if (!result.sessionToken) {
        throw new Error("The scheduling invitation could not be opened.");
      }

      setSessionToken(result.sessionToken);
      await loadAvailability(result.sessionToken);
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

  async function handleBook() {
    if (!sessionToken || !selectedSlot) return;
    setBookingNow(true);
    setError("");
    const weekToPreserve = currentWeekStart;

    try {
      const result = await invokeScheduler<BookResponse>({
        action: "book",
        sessionToken,
        startUtc: selectedSlot.startUtc,
      });
      if (!result.booked || !result.booking) {
        setSelectedSlot(null);
        setError(
          result.error ||
            "That time could not be booked. Please choose another time.",
        );
        await loadAvailability(sessionToken, weekToPreserve);
        return;
      }
      if (result.contact && result.organization) {
        setIdentity({
          contact: result.contact,
          organization: result.organization,
        });
      }
      setBooking(result.booking);
      setDays([]);
      setWeekStarts([]);
      setWeekIndex(0);
      setSelectedSlot(null);
    } catch (requestError) {
      setSelectedSlot(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "That time could not be booked.",
      );
      await loadAvailability(sessionToken, weekToPreserve);
    } finally {
      setBookingNow(false);
    }
  }

  const reset = () => {
    setIdentity(null);
    setSessionToken("");
    setDays([]);
    setWeekStarts([]);
    setWeekIndex(0);
    setSelectedSlot(null);
    setBooking(null);
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

        {!identity && !booking && (
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

        {identity && booking && (
          <section className="mx-auto max-w-2xl rounded-3xl border border-[#3B5147]/15 bg-white p-6 shadow-sm md:p-9">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#3B5147]/10 p-3 text-[#3B5147]">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#3B5147]">
                  Recording scheduled
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
                    {localTimeLabel(booking.startUtc, localZone)} in your local
                    timezone
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
              <div className="flex gap-3">
                <Video
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#3B5147]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold">StreamYard recording room</p>
                  <a
                    href={booking.streamyardUrl || STREAMYARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block break-all font-bold text-[#3B5147] underline underline-offset-4"
                  >
                    {booking.streamyardUrl || STREAMYARD_URL}
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-6 leading-7 text-[#111814]/65">
              A Google Calendar invitation is sent to the email address used for
              this booking. The invitation includes the same StreamYard link.
            </p>
          </section>
        )}

        {identity && !booking && (
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

            <section className="rounded-3xl border border-[#3B5147]/15 bg-white p-4 shadow-sm sm:p-6 md:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                    Select a time
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Available recording times
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
                    No valid recording times are open right now.
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

                      {SLOT_HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="grid grid-cols-[88px_repeat(5,minmax(132px,1fr))] border-b border-[#3B5147]/10 last:border-b-0"
                        >
                          <div className="sticky left-0 z-10 flex min-h-[78px] items-center justify-center border-r border-[#3B5147]/15 bg-[#F8F6F0] px-2 text-sm font-bold text-[#3B5147]">
                            {hourLabel(hour)}
                          </div>

                          {currentWeekDates.map((date) => {
                            const slot = slotByDateHour.get(`${date}|${hour}`);
                            const active =
                              Boolean(slot) &&
                              selectedSlot?.startUtc === slot?.startUtc;

                            if (!slot) {
                              return (
                                <div
                                  key={date}
                                  className="flex min-h-[78px] items-center justify-center border-r border-[#3B5147]/10 bg-[#F8F6F0]/55 px-2 last:border-r-0"
                                  aria-label={`${dayHeader(date).weekday} ${hourLabel(hour)} unavailable`}
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
                                className={`min-h-[78px] border-r border-[#3B5147]/10 px-3 py-3 text-center transition last:border-r-0 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B5147] ${
                                  active
                                    ? "bg-[#D7A92E]/20"
                                    : "bg-white hover:bg-[#3B5147]/5"
                                }`}
                                aria-pressed={active}
                              >
                                <span className="block text-sm font-bold text-[#3B5147]">
                                  {hourLabel(hour)}
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
                        Confirm recording
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
                          "Schedule recording"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
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
