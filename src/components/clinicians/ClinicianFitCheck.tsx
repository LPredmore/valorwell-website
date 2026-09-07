import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { trackHomeEvent } from "@/lib/tracking";

interface ClinicianFitCheckProps {
  onApply: () => void;
}

type Answer = "agree" | "disagree";

const principles = [
  {
    eyebrow: "Clinical Authority",
    title: "The person seeing the client should make the clinical decisions.",
    body: (
      <>
        <p>
          ValorWell supports the treating clinician's judgment on clinical fit,
          diagnosis, modality, treatment planning, frequency, referrals,
          discharge, and the direction of treatment.
        </p>
        <p>
          The boundaries are law, ethics, professional scope, and applicable
          program requirements—not administrative preference.
        </p>
        <p className="font-bold text-white">
          We trust independently licensed clinicians to practice independently.
        </p>
      </>
    ),
  },
  {
    eyebrow: "Your Time",
    title: "You should decide how much of your life belongs to work.",
    body: (
      <>
        <p>
          You choose how many hours you make available, when those hours happen,
          and the minimum age of clients you are willing to treat. There is no
          required fixed caseload.
        </p>
        <p className="font-bold text-white">
          We don't build your life around our schedule. We build around the
          availability you choose to give us.
        </p>
      </>
    ),
  },
  {
    eyebrow: "Your Job Is Therapy",
    title: "Your time should be spent doing therapy—not fighting the machinery around it.",
    body: (
      <>
        <p>
          ValorWell manages credentialing, authorizations, billing, claims,
          payer problems, and payment delays. For credentialing, you provide the
          professional information we need.
        </p>
        <p className="font-bold text-white">We handle the process from there.</p>
        <p>
          Your responsibility is seeing the client, making the clinical
          decisions, and completing the documentation required for their care.
        </p>
      </>
    ),
  },
  {
    eyebrow: "Technology Should Work for You",
    title: "Clinicians shouldn't have to work around their EHR.",
    body: (
      <>
        <p>
          So ours was designed around them. ValorWell's custom EHR was built
          from the requirements and feedback of the clinicians who actually use
          it.
        </p>
        <p>
          The goal is simple: reduce the unpaid auxiliary work surrounding
          treatment to as close to zero as possible.
        </p>
        <p className="font-bold text-white">
          Our clinicians tell us the documentation workflow is shorter and more
          efficient than other EHRs they've used.
        </p>
      </>
    ),
  },
  {
    eyebrow: "You Did the Work. You Get Paid.",
    title: "A no-show or payer problem shouldn't become your financial problem.",
    body: (
      <>
        <p className="text-xl font-bold text-white">You get paid for no-shows.</p>
        <p>
          ValorWell clinicians are paid weekly. If a payer delays payment,
          rejects a claim, or creates a billing problem, ValorWell handles it.
        </p>
        <p className="font-bold text-white">
          We don't transfer that risk back onto the clinician.
        </p>
      </>
    ),
  },
  {
    eyebrow: "Independence Means Something",
    title: "Professional freedom and professional accountability belong together.",
    body: (
      <>
        <p>
          ValorWell clinicians are independent 1099 contractors. You're not
          exclusive to us. Keep your private practice, keep another job, work
          with another organization, and give ValorWell whatever part of your
          schedule makes sense.
        </p>
        <p>
          ValorWell does not provide malpractice insurance. Clinicians remain
          responsible for maintaining their own professional coverage and for
          practicing legally, ethically, and within their scope.
        </p>
        <p className="font-bold text-white">
          We give clinicians responsibility because we trust them to accept the
          accountability that comes with it.
        </p>
      </>
    ),
  },
  {
    eyebrow: "Who ValorWell Serves",
    title: "We believe the best way to take care of our clients is to take care of their therapists.",
    body: (
      <>
        <p>
          ValorWell doesn't sit in the therapy room. You do. You hear the
          client, evaluate what is happening, and decide what treatment should
          look like.
        </p>
        <p className="font-bold text-white">
          ValorWell exists to support the therapists who serve veterans and
          their families.
        </p>
        <p>
          Hundreds of veterans and family members are already waiting for care
          across the country, with need in virtually every state as ValorWell
          expands Community Care.
        </p>
        <p className="font-bold text-white">
          They need clinicians. Clinicians want a better way to work with them.
          ValorWell exists to connect the two.
        </p>
      </>
    ),
  },
] as const;

export function ClinicianFitCheck({ onApply }: ClinicianFitCheckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<Answer | undefined>>(
    Array(principles.length).fill(undefined),
  );
  const [completed, setCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const agreeCount = useMemo(
    () => answers.filter((answer) => answer === "agree").length,
    [answers],
  );
  const majorityAgree = agreeCount >= 4;

  useEffect(() => {
    if (!completed && answers.some(Boolean)) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [currentIndex, completed, answers]);

  const answerCurrent = (answer: Answer) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = answer;
    setAnswers(nextAnswers);
    trackHomeEvent("clinician_fit_check_answered", {
      page: "clinicians",
      principle: currentIndex + 1,
      answer,
    });

    if (currentIndex === principles.length - 1) {
      const nextAgreeCount = nextAnswers.filter((item) => item === "agree").length;
      setCompleted(true);
      trackHomeEvent("clinician_fit_check_completed", {
        page: "clinicians",
        agree_count: nextAgreeCount,
        result: nextAgreeCount >= 4 ? "majority_agree" : "majority_disagree",
      });
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const handleSkip = () => {
    trackHomeEvent("clinician_skip_to_apply", { page: "clinicians" });
    onApply();
  };

  const handleApply = (source: string) => {
    trackHomeEvent(source, { page: "clinicians", agree_count: agreeCount });
    onApply();
  };

  if (completed) {
    return (
      <div
        className="mx-auto max-w-4xl rounded-3xl border border-white/15 bg-white/[0.07] p-7 shadow-2xl md:p-12"
        aria-live="polite"
      >
        {majorityAgree ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D7A92E]">
              Looks Like We See Things the Same Way
            </p>
            <h3 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
              ValorWell may fit the way you want to practice.
            </h3>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
              You don't need to leave your current practice or change your
              career. Decide how much room you want to make for veterans and
              family members who are already looking for care.
            </p>
            <button
              type="button"
              onClick={() => handleApply("clinician_fit_check_majority_agree")}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Raise My Hand
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D7A92E]">
              We May Look at Clinical Practice Differently
            </p>
            <h3 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
              ValorWell may not be the environment you're looking for—and that's okay.
            </h3>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
              ValorWell is deliberately built around clinician autonomy,
              professional accountability, and a clinician-first operating
              model. If several of those principles don't align with how you
              want to work, we may not be the right fit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                  setCurrentIndex(0);
                }}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Review My Answers
              </button>
              <button
                type="button"
                onClick={() => handleApply("clinician_apply_anyway")}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#111814] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A92E]"
              >
                Still Interested? Apply Anyway
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const principle = principles[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progress = ((currentIndex + 1) / principles.length) * 100;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between gap-4 text-sm text-white/60">
        <span className="font-bold tabular-nums">
          {String(currentIndex + 1).padStart(2, "0")} / {String(principles.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="font-bold text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Skip to Apply
        </button>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full bg-[#D7A92E] transition-[width] motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="mt-6 min-h-[31rem] rounded-3xl border border-white/15 bg-white/[0.07] p-7 shadow-2xl md:flex md:min-h-[34rem] md:flex-col md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D7A92E]">
          {principle.eyebrow}
        </p>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 max-w-3xl text-3xl font-bold leading-tight outline-none md:text-5xl"
        >
          {principle.title}
        </h3>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-7 text-white/72 md:text-lg md:leading-8">
          {principle.body}
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row md:mt-auto md:pt-10">
          <button
            type="button"
            onClick={() => answerCurrent("agree")}
            aria-pressed={currentAnswer === "agree"}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#D7A92E] px-6 py-3 text-sm font-bold text-[#111814] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            I Agree
          </button>
          <button
            type="button"
            onClick={() => answerCurrent("disagree")}
            aria-pressed={currentAnswer === "disagree"}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            I Don't Agree
          </button>
        </div>

        {currentIndex > 0 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        ) : null}
      </article>
    </div>
  );
}
