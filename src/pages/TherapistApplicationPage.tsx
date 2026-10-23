import { FormEvent, useEffect, useMemo, useState } from "react";
import { ProfileQuestions, DisclosureQuestions, EmploymentQuestions, ReviewQuestions, EMPTY_PROFILE, EMPTY_DISCLOSURES, EMPTY_EMPLOYMENT, EMPTY_ATTESTATION } from "@/components/therapist/ProfessionalSteps";
import { type ApplicantProfile, type ApplicantDisclosures, type ApplicantEmployment, type Attestation, type Employment, validateApplicantProfile, validateApplicantDisclosures, validateApplicantEmployment, validateApplicantAttestation } from "@/lib/therapistProfessional";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, LockKeyhole, Mail, Search, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { billingHubSupabase } from "@/integrations/supabase/client";
import {
  LICENSE_CATEGORIES,
  MAX_LICENSE_NUMBER_LENGTH,
  US_STATES,
  isValidEmail,
  isValidNpi,
  normalizeEmail,
  type TherapistApplication,
} from "@/lib/therapistApplication";

const SESSION_STORAGE_KEY = "therapist-application-session";

type Stage = "email" | "code" | "form" | "done";

type ApiResult = {
  ok?: boolean;
  message?: string;
  error?: string;
  sessionToken?: string;
  application?: TherapistApplication;
  entries?: Employment[];
  step?: number;
};

async function invoke(body: Record<string, unknown>): Promise<ApiResult> {
  const { data, error } = await billingHubSupabase.functions.invoke("therapist-application", { body });
  if (error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      const info = (await context.json().catch(() => ({}))) as ApiResult;
      if (typeof info.error === "string") return { ok: false, error: info.error, step: info.step };
    }
    return { ok: false, error: "The application is temporarily unavailable. Please email info@valorwell.org." };
  }
  return (data ?? {}) as ApiResult;
}

const STEP_TITLES = ["License type", "License numbers", "NPI", "Your details", "Disclosures", "Experience", "Review"];

function stateName(code: string): string {
  return US_STATES.find((s) => s.code === code)?.name ?? code;
}

export default function TherapistApplicationPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [application, setApplication] = useState<TherapistApplication | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Step 1
  const [licenseCategory, setLicenseCategory] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [stateQuery, setStateQuery] = useState("");
  // Step 2
  const [licenseNumbers, setLicenseNumbers] = useState<Record<string, string>>({});
  // Step 3
  const [hasNpi, setHasNpi] = useState<boolean | null>(null);
  const [npi, setNpi] = useState("");
  const [profile, setProfile] = useState<ApplicantProfile>(EMPTY_PROFILE);
  const [disclosures, setDisclosures] = useState<ApplicantDisclosures>(EMPTY_DISCLOSURES);
  const [employment, setEmployment] = useState<ApplicantEmployment>(EMPTY_EMPLOYMENT);
  const [attestation, setAttestation] = useState<Attestation>(EMPTY_ATTESTATION);
  const [parsingResume, setParsingResume] = useState(false);

  const hydrate = (saved: TherapistApplication) => {
    setApplication(saved);
    setLicenseCategory(saved.licenseCategory ?? "");
    setStates(saved.states ?? []);
    setLicenseNumbers(saved.licenseNumbers ?? {});
    setHasNpi(saved.npiDeclared);
    setNpi(saved.npi ?? "");
    setProfile(saved.details?.profile ?? {...EMPTY_PROFILE,firstName:saved.firstName??"",lastName:saved.lastName??""});
    setDisclosures(saved.details?.disclosures ?? EMPTY_DISCLOSURES);
    setEmployment(saved.details?.employment ?? EMPTY_EMPLOYMENT);
    setAttestation(saved.details?.attestation ?? EMPTY_ATTESTATION);
    if (saved.status === "submitted") setStage("done");
  };

  // Resume an in-progress session after a page refresh (tab-scoped storage).
  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!token) return;
    setBusy(true);
    invoke({ action: "session", sessionToken: token })
      .then((result) => {
        if (result.ok && result.application) {
          setSessionToken(token);
          hydrate(result.application);
          setStage((current) => (current === "email" ? "form" : current));
        } else {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      })
      .finally(() => setBusy(false));
  }, []);

  const requestCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    const result = await invoke({ action: "request_code", email: normalized });
    setBusy(false);
    if (result.ok) {
      setEmail(normalized);
      setNotice(result.message ?? "If that email matches a registration we have on file, a verification code is on its way.");
      setStage("code");
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    const result = await invoke({ action: "verify_code", email, code: code.trim() });
    setBusy(false);
    if (result.ok && result.sessionToken && result.application) {
      setSessionToken(result.sessionToken);
      sessionStorage.setItem(SESSION_STORAGE_KEY, result.sessionToken);
      hydrate(result.application);
      setNotice(null);
      setStage("form");
    } else {
      setError(result.error ?? "That code is invalid or has expired. Request a new one.");
    }
  };

  const saveStep = async (nextStep: number | "done") => {
    if (!sessionToken) return;
    setError(null);

    let body: Record<string, unknown>;
    if (step === 1) {
      if (!licenseCategory) {
        setError("Choose the license category that fits you best.");
        return;
      }
      if (states.length === 0) {
        setError("Select at least one state where you are licensed.");
        return;
      }
      body = { action: "save", sessionToken, step: 1, licenseCategory, states };
    } else if (step === 2) {
      const missing = states.filter((s) => !(licenseNumbers[s] ?? "").trim());
      if (missing.length > 0) {
        setError(`Enter your license number for ${missing.map(stateName).join(", ")}.`);
        return;
      }
      body = { action: "save", sessionToken, step: 2, licenseNumbers };
    } else if (step === 3) {
      if (hasNpi === null) {
        setError("Tell us whether you have an NPI number.");
        return;
      }
      if (hasNpi && !isValidNpi(npi.trim())) {
        setError("Enter a valid 10-digit NPI number.");
        return;
      }
      body = { action: "save", sessionToken, step: 3, hasNpi, npi: npi.trim() };
    } else if(step === 4) {
      const checked=validateApplicantProfile(profile);
      if (!checked.ok) {setError(checked.error);return;}
      body={action:"save",sessionToken,step:4,profile:checked.value};
    } else if(step === 5) {
      const checked=validateApplicantDisclosures(disclosures);
      if(!checked.ok){setError(checked.error);return;}
      body={action:"save",sessionToken,step:5,disclosures:checked.value};
    } else if(step === 6) {
      const checked=validateApplicantEmployment(employment);
      if(!checked.ok){setError(checked.error);return;}
      body={action:"save",sessionToken,step:6,employment:checked.value};
    } else {
      const checked=validateApplicantAttestation(attestation);
      if(!checked.ok){setError(checked.error);return;}
      body={action:"save",sessionToken,step:7,attestation:checked.value};
    }

    setBusy(true);
    const saved = await invoke(body);
    if (!saved.ok) {
      setBusy(false);
      setError(saved.error ?? "Your answers could not be saved. Please try again.");
      return;
    }
    if (saved.application) hydrate(saved.application);

    if (nextStep === "done") {
      const completed = await invoke({ action: "complete", sessionToken });
      setBusy(false);
      if (completed.ok && completed.application) {
        hydrate(completed.application);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setStage("done");
      } else {
        if (completed.step) setStep(completed.step);
        setError(completed.error ?? "Your application could not be submitted. Please try again.");
      }
      return;
    }
    setBusy(false);
    setStep(nextStep);
  };

  const parseUploadedResume = async (file:File) => {
    if (!sessionToken) throw new Error("Verify your email to continue.");
    if(file.size>2*1024*1024)throw new Error("Please upload a file smaller than 2 MB.");
    setParsingResume(true);
    try {
      const bytes=new Uint8Array(await file.arrayBuffer());
      let binary="";
      for(let i=0;i<bytes.length;i+=8192)
        binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+8192,bytes.length)));
      const response=await invoke({action:"parse_resume",sessionToken,filename:file.name,base64:btoa(binary)});
      if(!response.ok || !response.entries)throw new Error(response.error??"Please enter work history manually or skip.");
      setEmployment({choice:"resume",entries:response.entries});
    } finally {setParsingResume(false);}
  };

  const filteredStates = useMemo(() => {
    const query = stateQuery.trim().toLowerCase();
    if (!query) return US_STATES;
    return US_STATES.filter(
      (s) => s.name.toLowerCase().includes(query) || s.code.toLowerCase() === query,
    );
  }, [stateQuery]);

  const toggleState = (codeValue: string) => {
    setStates((current) =>
      current.includes(codeValue)
        ? current.filter((s) => s !== codeValue)
        : [...current, codeValue],
    );
  };

  return (
    <Layout>
      <SEO
        title="Therapist Application"
        description="Complete your secure ValorWell clinician application, professional qualifications and disclosures."
        canonical="/therapistapplication"
        noIndex
      />
      <div className="bg-background py-10 md:py-14">
        <div className="container mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Continue your application.</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Start with your license details, then complete your professional application at a comfortable pace.
            Each stage saves securely, and you can return using the same email address.
          </p>

          {stage === "form" && (
            <ol aria-label="Application progress" className="mt-8 grid grid-cols-7 gap-1">
              {STEP_TITLES.map((title, index) => {
                const number = index + 1;
                const active = number === step;
                const complete = number < step;
                return (
                  <li key={title} className="flex min-w-0 flex-col items-center gap-1">
                    <span
                      aria-current={active ? "step" : undefined}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : complete
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {complete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : number}
                    </span>
                    <span className={`hidden text-center text-[10px] font-medium md:block ${active ? "text-foreground" : "text-muted-foreground"}`}>
                      {title}
                    </span>
                    
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-9">
            {stage === "email" && (
              <form onSubmit={requestCode} noValidate>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-foreground">Verify your email</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Enter the same email address you used when you raised your hand on our clinicians
                  page. We&apos;ll email you a one-time code to confirm it&apos;s you.
                </p>
                <Label htmlFor="ta-email" className="mt-6 block">Email</Label>
                <Input
                  id="ta-email"
                  type="email"
                  autoComplete="email"
                  className="mt-2"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}</p>}
                <Button type="submit" disabled={busy} className="mt-6 min-h-12 w-full">
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Sending…</> : "Email me a code"}
                </Button>
              </form>
            )}

            {stage === "code" && (
              <form onSubmit={verifyCode} noValidate>
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-foreground">Enter your code</h2>
                </div>
                {notice && <p className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">{notice}</p>}
                <Label htmlFor="ta-code" className="mt-6 block">6-digit code</Label>
                <Input
                  id="ta-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="mt-2 tracking-[0.5em]"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}</p>}
                <Button type="submit" disabled={busy} className="mt-6 min-h-12 w-full">
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Verifying…</> : "Verify and continue"}
                </Button>
                <button
                  type="button"
                  className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
                  onClick={() => { setStage("email"); setCode(""); setError(null); setNotice(null); }}
                >
                  Use a different email or resend the code
                </button>
              </form>
            )}

            {stage === "form" && step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">What kind of licensed mental health practice do you hold?</h2>
                <fieldset className="mt-5">
                  <legend className="sr-only">License category</legend>
                  <div className="space-y-3">
                    {LICENSE_CATEGORIES.map((category) => (
                      <label
                        key={category.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                          licenseCategory === category.value ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <input
                          type="radio"
                          name="license-category"
                          className="mt-1 h-4 w-4 shrink-0 accent-primary"
                          checked={licenseCategory === category.value}
                          onChange={() => setLicenseCategory(category.value)}
                        />
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{category.label}</span>
                          {category.equivalents && (
                            <span className="block text-xs text-muted-foreground">{category.equivalents}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <h3 className="mt-8 text-lg font-bold text-foreground">Which states are you licensed in?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Select every state where you hold an active license.</p>

                {states.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Selected states">
                    {states.map((codeValue) => (
                      <li key={codeValue} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {stateName(codeValue)}
                        <button
                          type="button"
                          aria-label={`Remove ${stateName(codeValue)}`}
                          onClick={() => toggleState(codeValue)}
                          className="rounded-full p-0.5 hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    aria-label="Search states"
                    placeholder="Search states…"
                    className="pl-9"
                    value={stateQuery}
                    onChange={(event) => setStateQuery(event.target.value)}
                  />
                </div>
                <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-border" role="group" aria-label="States">
                  {filteredStates.map((state) => (
                    <label key={state.code} className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 hover:bg-secondary/60">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={states.includes(state.code)}
                        onChange={() => toggleState(state.code)}
                      />
                      <span className="text-sm text-foreground">{state.name}</span>
                    </label>
                  ))}
                  {filteredStates.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No states match your search.</p>
                  )}
                </div>

                {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}</p>}
                <Button onClick={() => saveStep(2)} disabled={busy} className="mt-6 min-h-12 w-full">
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Saving…</> : <>Next <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" /></>}
                </Button>
              </div>
            )}

            {stage === "form" && step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">Your license number in each state</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the license number exactly as it appears on your license, including any leading zeros or dashes.
                </p>
                <div className="mt-5 space-y-5">
                  {states.map((codeValue) => (
                    <div key={codeValue}>
                      <Label htmlFor={`ta-license-${codeValue}`}>{stateName(codeValue)}</Label>
                      <Input
                        id={`ta-license-${codeValue}`}
                        className="mt-2"
                        maxLength={MAX_LICENSE_NUMBER_LENGTH}
                        value={licenseNumbers[codeValue] ?? ""}
                        onChange={(event) =>
                          setLicenseNumbers((current) => ({ ...current, [codeValue]: event.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
                {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => { setStep(1); setError(null); }} disabled={busy} className="min-h-12">
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Back
                  </Button>
                  <Button onClick={() => saveStep(3)} disabled={busy} className="min-h-12 flex-1">
                    {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Saving…</> : <>Next <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" /></>}
                  </Button>
                </div>
              </div>
            )}

            {stage === "form" && step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">Do you have an NPI number?</h2>
                <fieldset className="mt-5">
                  <legend className="sr-only">Do you have an NPI number?</legend>
                  <div className="flex gap-3">
                    {([true, false] as const).map((value) => (
                      <label
                        key={String(value)}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold ${
                          hasNpi === value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name="has-npi"
                          className="h-4 w-4 accent-primary"
                          checked={hasNpi === value}
                          onChange={() => setHasNpi(value)}
                        />
                        {value ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {hasNpi === true && (
                  <div className="mt-5">
                    <Label htmlFor="ta-npi">NPI number</Label>
                    <Input
                      id="ta-npi"
                      inputMode="numeric"
                      maxLength={10}
                      className="mt-2"
                      value={npi}
                      onChange={(event) => setNpi(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">Your 10-digit National Provider Identifier.</p>
                  </div>
                )}
                {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => { setStep(2); setError(null); }} disabled={busy} className="min-h-12">
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Back
                  </Button>
                  <Button onClick={() => saveStep(4)} disabled={busy} className="min-h-12 flex-1">
                    {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Saving…</> : "Next: professional details"}
                  </Button>
                </div>
              </div>
            )}


            {stage === "form" && step === 4 && (
              <div>
                <ProfileQuestions value={profile} onChange={setProfile}/>
                {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={()=>{setStep(3);setError(null)}} disabled={busy}>Back</Button>
                  <Button className="flex-1" onClick={()=>saveStep(5)} disabled={busy}>
                    {busy?"Saving…":"Next: professional disclosures"}
                  </Button>
                </div>
              </div>
            )}
            {stage === "form" && step === 5 && (
              <div>
                <DisclosureQuestions value={disclosures} onChange={setDisclosures}/>
                {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={()=>{setStep(4);setError(null)}} disabled={busy}>Back</Button>
                  <Button className="flex-1" onClick={()=>saveStep(6)} disabled={busy}>
                    {busy?"Saving…":"Next: optional experience"}
                  </Button>
                </div>
              </div>
            )}
            {stage === "form" && step === 6 && (
              <div>
                <EmploymentQuestions value={employment} onChange={setEmployment}
                  onParse={parseUploadedResume} parsing={parsingResume}/>
                {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={()=>{setStep(5);setError(null)}} disabled={busy}>Back</Button>
                  <Button className="flex-1" onClick={()=>saveStep(7)} disabled={busy||parsingResume}>
                    {busy?"Saving…":"Review application"}
                  </Button>
                </div>
              </div>
            )}
            {stage === "form" && step === 7 && (
              <div>
                <ReviewQuestions profile={profile} disclosures={disclosures} employment={employment}
                  attestation={attestation} onChange={setAttestation} licensedStates={states.map(stateName)}/>
                {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm">{error}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={()=>{setStep(6);setError(null)}} disabled={busy}>Back</Button>
                  <Button className="flex-1" onClick={()=>saveStep("done")} disabled={busy}>
                    {busy?"Submitting…":"Submit professional application"}
                  </Button>
                </div>
              </div>
            )}

            {stage === "done" && (
              <div className="text-center" role="status">
                <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
                <h2 className="mt-6 text-2xl font-bold text-foreground">Your professional application is complete.</h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                  We have what we need for this step. Our team will review your details and reach
                  out about what comes next. Questions in the meantime? Email{" "}
                  <a href="mailto:info@valorwell.org" className="font-medium text-primary underline underline-offset-4">
                    info@valorwell.org
                  </a>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
