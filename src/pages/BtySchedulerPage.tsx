import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
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

function SchedulerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-[#F4F1E8] text-[#111814]">
      <div className="container-wide py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">{children}</div>
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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SchedulerSlot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checking, setChecking] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingNow, setBookingNow] = useState(false);
  const [error, setError] = useState("");

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? null,
    [days, selectedDate],
  );

  async function loadAvailability(token: string) {
    setLoadingAvailability(true);
    setError("");
    try {
      const result = await invokeScheduler<AvailabilityResponse>({
        action: "availability",
        sessionToken: token,
      });
      setDays(result.days ?? []);
      setSelectedDate(result.days?.[0]?.date ?? "");
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
    setSelectedDate("");
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
        await loadAvailability(sessionToken);
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
      setSelectedDate("");
      setSelectedSlot(null);
    } catch (requestError) {
      setSelectedSlot(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "That time could not be booked.",
      );
      await loadAvailability(sessionToken);
    } finally {
      setBookingNow(false);
    }
  }

  const reset = () => {
    setIdentity(null);
    setSessionToken("");
    setDays([]);
    setSelectedDate("");
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
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <aside className="rounded-3xl border border-[#3B5147]/15 bg-[#3B5147] p-6 text-white shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4F1E8]/70">
                Scheduling for
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                {identity.organization.name}
              </h2>
              <p className="mt-2 text-white/75">
                {identity.contact.name}
                <br />
                {identity.contact.email}
              </p>

              <div className="mt-8 space-y-5 border-t border-white/15 pt-6 text-sm leading-6 text-white/80">
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>
                    Recordings are one hour. Every displayed time includes the
                    required calendar buffers.
                  </p>
                </div>
                <div className="flex gap-3">
                  <CalendarDays
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    Only one Beyond The Yellow recording can be scheduled on a
                    calendar day.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Video className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>
                    Your calendar invitation will use ValorWell's StreamYard
                    recording room. No Google Meet is added.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                className="mt-8 min-h-11 rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Use a different email
              </button>
            </aside>

            <section className="rounded-3xl border border-[#3B5147]/15 bg-white p-6 shadow-sm md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B5147]">
                  Select a date
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Available recording times
                </h2>
                <p className="mt-2 leading-6 text-[#111814]/65">
                  Every time below is labeled in Central Time. If your device is
                  set to another timezone, your local time appears underneath.
                </p>
              </div>

              {loadingAvailability ? (
                <div className="flex min-h-64 items-center justify-center gap-3 text-[#3B5147]">
                  <Loader2
                    className="h-6 w-6 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span className="font-bold">Checking calendars</span>
                </div>
              ) : days.length === 0 ? (
                <div className="mt-8 rounded-2xl bg-[#F4F1E8] p-6">
                  <p className="font-bold">No valid recording times are open right now.</p>
                  <p className="mt-2 leading-6 text-[#111814]/65">
                    Email info@valorwell.org and we can coordinate a time
                    directly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-7 flex gap-3 overflow-x-auto pb-2">
                    {days.map((day) => {
                      const reference = day.slots[0]?.startUtc;
                      const active = selectedDate === day.date;
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day.date);
                            setSelectedSlot(null);
                            setError("");
                          }}
                          className={`min-h-20 min-w-36 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 ${
                            active
                              ? "border-[#3B5147] bg-[#3B5147] text-white"
                              : "border-[#3B5147]/15 bg-[#F4F1E8] hover:border-[#3B5147]/40"
                          }`}
                        >
                          <span className="block text-sm font-bold">
                            {reference ? centralDateLabel(reference) : day.date}
                          </span>
                          <span
                            className={`mt-1 block text-xs ${
                              active ? "text-white/70" : "text-[#111814]/55"
                            }`}
                          >
                            {day.slots.length}{" "}
                            {day.slots.length === 1 ? "time" : "times"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDay && (
                    <div className="mt-7">
                      <h3 className="text-lg font-bold">
                        {centralDateLabel(selectedDay.slots[0].startUtc)}
                      </h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {selectedDay.slots.map((slot) => {
                          const active =
                            selectedSlot?.startUtc === slot.startUtc;
                          return (
                            <button
                              key={slot.startUtc}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setError("");
                              }}
                              className={`min-h-20 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 ${
                                active
                                  ? "border-[#D7A92E] bg-[#D7A92E]/15"
                                  : "border-[#3B5147]/15 hover:border-[#3B5147]/40"
                              }`}
                            >
                              <span className="block font-bold text-[#111814]">
                                {centralTimeLabel(slot.startUtc)}
                              </span>
                              {localZone !== CENTRAL_ZONE && (
                                <span className="mt-1 block text-sm text-[#111814]/55">
                                  {localTimeLabel(slot.startUtc, localZone)} local
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-7 rounded-2xl border border-[#D7A92E]/35 bg-[#D7A92E]/10 p-5">
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
                        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B5147] px-5 py-3 font-bold text-white transition hover:bg-[#30443b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5147] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
