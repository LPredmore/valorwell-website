import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Loader2, LockKeyhole, Mail, Video } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { billingHubSupabase } from "@/integrations/supabase/client";

const ZONE = "America/Chicago";
type Slot = { startUtc: string; endUtc: string };
type Day = { date: string; slots: Slot[] };
type Booking = { startUtc: string; endUtc: string; meetingUrl: string | null };
type Verified = { eligible: boolean; name?: string; sessionToken?: string; booking?: Booking | null; error?: string };
type Availability = {
  state: "ready" | "booked"; timezone?: string; days?: Day[]; booking?: Booking | null;
  firstBookableDate?: string; lastBookableDate?: string;
};
type BookResult = { booked: boolean; booking?: Booking; error?: string; reconciliationPending?: boolean };

function utcDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}
function addDays(value: string, amount: number) {
  const date = utcDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}
function monday(date: string) {
  return addDays(date, -((utcDate(date).getUTCDay() + 6) % 7));
}
function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(utcDate(date));
}
function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(utcDate(date));
}
function centralTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: ZONE }).format(new Date(value));
}
function localTime(value: string) {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!local || local === ZONE) return "";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: local, timeZoneName: "short" }).format(new Date(value));
}
function longDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: ZONE }).format(new Date(value));
}
async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await billingHubSupabase.functions.invoke("clinician-interview-scheduler", { body });
  if (error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      const info = await context.json().catch(() => ({}));
      if (typeof info.error === "string") throw new Error(info.error);
    }
    throw new Error("Scheduling is temporarily unavailable. Please email info@valorwell.org.");
  }
  return data as T;
}
export default function ClinicianInterviewSchedulerPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [firstDate, setFirstDate] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [week, setWeek] = useState(0);
  const [chosen, setChosen] = useState<Slot | null>(null);
  const [loading, setLoading] = useState<"verify" | "availability" | "book" | "cancel" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const weeks = useMemo(() => {
    if (!firstDate || !lastDate) return [];
    const result: string[] = [];
    for (let d = monday(firstDate); d <= lastDate; d = addDays(d, 7)) result.push(d);
    return result;
  }, [firstDate, lastDate]);
  const currentDays = useMemo(
    () => weeks[week] ? Array.from({ length: 5 }, (_, index) => addDays(weeks[week], index)) : [],
    [weeks, week],
  );
  const slotsByDay = useMemo(() => new Map(days.map(day => [day.date, day.slots])), [days]);

  async function loadAvailability(sessionToken: string, preserveWeek = 0) {
    setLoading("availability");
    try {
      const result = await invoke<Availability>({ action: "availability", sessionToken });
      if (result.state === "booked" && result.booking) {
        setBooking(result.booking);
        setDays([]);
        return;
      }
      setDays(result.days || []);
      setFirstDate(result.firstBookableDate || "");
      setLastDate(result.lastBookableDate || "");
      setWeek(preserveWeek);
    } finally {
      setLoading(null);
    }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice(""); setLoading("verify");
    try {
      const found = await invoke<Verified>({ action: "validate", email: email.trim() });
      if (!found.eligible || !found.sessionToken) {
        throw new Error("We couldn't match that email to an active clinician application. Please use the email address supplied when you applied.");
      }
      setToken(found.sessionToken);
      setName(found.name || "Applicant");
      setBooking(found.booking || null);
      setChosen(null);
      if (!found.booking) await loadAvailability(found.sessionToken);
    } catch (e) {
      setToken(""); setName("");
      setError(e instanceof Error ? e.message : "We couldn't verify your application.");
    } finally { setLoading(null); }
  }
  async function book() {
    if (!chosen || !token) return;
    setLoading("book"); setError(""); setNotice("");
    const selected = chosen;
    const priorWeek = week;
    try {
      const result = await invoke<BookResult>({ action: "book", sessionToken: token, startUtc: selected.startUtc });
      if (!result.booked || !result.booking) throw new Error(result.error || "The selected appointment could not be booked.");
      setBooking(result.booking);
      setChosen(null);
      setNotice(result.reconciliationPending
        ? "The Google invitation was sent, but your application record needs reconciliation. Please contact ValorWell if the appointment does not appear."
        : "Your interview is confirmed. A Google Calendar invitation has been sent to your application email.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "This time could not be booked.";
      setChosen(null);
      setError(message);
      try { await loadAvailability(token, priorWeek); } catch { /* Keep the booking error visible. */ }
    } finally { setLoading(null); }
  }
  async function cancel() {
    if (!token || !booking) return;
    if (!window.confirm("Cancel your clinician interview? You will be able to choose another available time afterward.")) return;
    setLoading("cancel"); setError(""); setNotice("");
    try {
      const result = await invoke<{ cancelled: boolean; error?: string }>({ action: "cancel", sessionToken: token });
      if (!result.cancelled) throw new Error(result.error || "The appointment could not be cancelled.");
      setBooking(null);
      setNotice("Your interview was cancelled. You can select a new date below.");
      await loadAvailability(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please contact ValorWell about your appointment.");
    } finally { setLoading(null); }
  }
  function reset() {
    setToken(""); setName(""); setBooking(null); setDays([]); setFirstDate(""); setLastDate("");
    setChosen(null); setError(""); setNotice(""); setWeek(0);
  }
  return (
    <Layout>
      <SEO
        title="Schedule Your Clinician Interview | ValorWell"
        description="Private interview scheduler for existing ValorWell clinician applicants."
        canonical="/clinicians/interview"
        noIndex
      />
      <main className="min-h-[70vh] bg-[#F4F1E8] px-4 py-10 text-[#111814] md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-9 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B5147]">ValorWell clinician recruiting</p>
            <h1 className="mt-4 text-3xl font-bold md:text-5xl">Schedule your clinician interview.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#111814]/70">
              Interviews last one hour. Please select a time at least 72 hours in advance.
              All available times are shown in Central Time.
            </p>
          </div>
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{error}</div>}
          {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">{notice}</div>}
          {!token ? (
            <section className="mx-auto max-w-xl rounded-3xl bg-white p-7 shadow-sm">
              <LockKeyhole className="mb-3 h-7 w-7 text-[#3B5147]" aria-hidden />
              <h2 className="text-xl font-bold">Verify your application</h2>
              <p className="mt-2 text-[#111814]/70">Enter the same email address you used when applying to ValorWell. No account is required.</p>
              <form onSubmit={verify} className="mt-6">
                <label htmlFor="clinician-interview-email" className="mb-2 block text-sm font-bold">Application email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#3B5147]/70" aria-hidden />
                  <input id="clinician-interview-email" type="email" autoComplete="email" required value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="your.application@email.com"
                    className="min-h-12 w-full rounded-xl border border-[#3B5147]/30 bg-[#F4F1E8] py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#3B5147]" />
                </div>
                <button type="submit" disabled={loading !== null} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B5147] px-5 py-3 font-bold text-white disabled:opacity-60">
                  {loading === "verify" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <CalendarDays className="h-5 w-5" aria-hidden />}
                  Continue to available times
                </button>
              </form>
            </section>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#3B5147] p-5 text-white">
                <div><p className="text-xs uppercase tracking-wider text-white/70">Scheduling for</p><p className="text-xl font-bold">{name}</p><p className="text-sm text-white/75">{email.trim()}</p></div>
                <button type="button" onClick={reset} className="rounded-lg border border-white/50 px-4 py-2 text-sm font-semibold hover:bg-white/10">Use a different email</button>
              </div>
              {booking ? (
                <section className="mx-auto max-w-2xl rounded-3xl bg-white p-7 shadow-sm">
                  <CheckCircle2 className="mb-3 h-9 w-9 text-[#3B5147]" aria-hidden />
                  <h2 className="text-2xl font-bold">Your interview is scheduled</h2>
                  <p className="mt-3 text-lg font-semibold">{longDate(booking.startUtc)}</p>
                  <p className="mt-1">{centralTime(booking.startUtc)}–{centralTime(booking.endUtc)} Central Time</p>
                  {localTime(booking.startUtc) && <p className="mt-1 text-sm text-[#111814]/65">Your local time: {localTime(booking.startUtc)}</p>}
                  <p className="mt-4 text-[#111814]/70">Your calendar invitation and meeting link will be sent to the email you used to apply.</p>
                  {booking.meetingUrl && <a href={booking.meetingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3B5147] px-5 py-3 font-bold text-white"><Video className="h-5 w-5" aria-hidden /> Join Google Meet</a>}
                  <div className="mt-6 border-t pt-5">
                    <button type="button" disabled={loading !== null} onClick={cancel} className="rounded-lg border border-[#3B5147]/30 px-4 py-2 font-semibold disabled:opacity-60">
                      Cancel and choose another time
                    </button>
                    <p className="mt-2 text-sm text-[#111814]/60">Changes within 72 hours of your interview require assistance at info@valorwell.org.</p>
                  </div>
                </section>
              ) : (
                <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold md:text-2xl">Select an available hour</h2>
                      <p className="mt-1 text-sm text-[#111814]/65">Weekdays, 9 AM–2 PM Central. One clinician interview is offered per day.</p>
                    </div>
                    {loading === "availability" && <Loader2 className="h-6 w-6 animate-spin text-[#3B5147]" aria-label="Loading available times" />}
                  </div>
                  {weeks.length > 0 && (
                    <>
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <button type="button" aria-label="Previous week" disabled={week === 0 || loading !== null} onClick={() => { setChosen(null); setWeek(v => v - 1); }} className="rounded-xl border px-3 py-2 disabled:opacity-30">
                          <ChevronLeft className="h-5 w-5" aria-hidden />
                        </button>
                        <h3 className="text-center font-bold">{dateLabel(weeks[week])} – {dateLabel(addDays(weeks[week], 4))}</h3>
                        <button type="button" aria-label="Next week" disabled={week >= weeks.length - 1 || loading !== null} onClick={() => { setChosen(null); setWeek(v => v + 1); }} className="rounded-xl border px-3 py-2 disabled:opacity-30">
                          <ChevronRight className="h-5 w-5" aria-hidden />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                        {currentDays.map(date => (
                          <div key={date} className="min-h-48 rounded-2xl border border-[#3B5147]/15 bg-[#F4F1E8]/60 p-3">
                            <p className="text-center text-sm font-semibold">{dayLabel(date)} {dateLabel(date)}</p>
                            <div className="mt-3 space-y-2">
                              {(slotsByDay.get(date) || []).map(slot => (
                                <button key={slot.startUtc} type="button" disabled={loading !== null}
                                  aria-pressed={chosen?.startUtc === slot.startUtc}
                                  onClick={() => setChosen(slot)}
                                  className={"min-h-11 w-full rounded-lg border px-2 py-2 text-sm font-semibold transition disabled:opacity-60 " +
                                    (chosen?.startUtc === slot.startUtc
                                      ? "border-[#3B5147] bg-[#3B5147] text-white"
                                      : "border-[#3B5147]/25 bg-white text-[#3B5147] hover:bg-[#3B5147]/10")}>
                                  {centralTime(slot.startUtc)}
                                </button>
                              ))}
                              {!slotsByDay.get(date)?.length && <p className="pt-4 text-center text-xs text-[#111814]/50">Unavailable</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {chosen && (
                        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#3B5147]/20 bg-[#F4F1E8] p-5">
                          <div>
                            <p className="font-bold">{longDate(chosen.startUtc)}</p>
                            <p className="text-sm">{centralTime(chosen.startUtc)}–{centralTime(chosen.endUtc)} Central Time</p>
                            {localTime(chosen.startUtc) && <p className="text-xs text-[#111814]/65">Your time: {localTime(chosen.startUtc)}</p>}
                          </div>
                          <button type="button" disabled={loading !== null} onClick={book}
                            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3B5147] px-6 py-3 font-bold text-white disabled:opacity-60">
                            {loading === "book" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
                            Confirm interview
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {!days.length && loading !== "availability" && <p className="py-8 text-center text-[#111814]/70">No interview times are currently available. Please contact info@valorwell.org for assistance.</p>}
                  <p className="mt-6 text-center text-sm text-[#111814]/60">Times are checked against business and personal calendars again when you confirm your appointment.</p>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}
