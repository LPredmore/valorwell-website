import { AuthorityPage, CRISIS_NOTE } from "@/components/authority/AuthorityPage";

export default function VACommunityCareMentalHealth() {
  return (
    <AuthorityPage
      title="VA Community Care Mental Health Support"
      description="Learn about VA Community Care mental health eligibility, access standards, referrals, authorization, records to keep, and ValorWell care options."
      canonical="/va-community-care-mental-health"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "VA Community Care Mental Health", url: "/va-community-care-mental-health" },
      ]}
      eyebrow="VA Community Care"
      h1="VA Community Care mental health access can be confusing, slow, and hard to navigate."
      subhead="ValorWell provides telehealth mental health care when the required VA authorization, clinician licensure, availability, capacity, and clinical fit align."
      lastReviewed="September 6, 2026"
      sourceNote={
        <>
          Primary VA sources: {" "}
          <a
            href="https://www.va.gov/resources/eligibility-for-community-care-outside-va/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            Community Care eligibility and access standards
          </a>
          {" "}and {" "}
          <a
            href="https://www.va.gov/resources/how-to-get-community-care-referrals-and-schedule-appointments/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            referrals and scheduling
          </a>
          . VA currently lists a 30-minute average drive-time or 20-day wait-time access standard for mental health care.
        </>
      }
      heroCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Review Community Care Resources", to: "/resources/va-community-care", variant: "secondary" },
      ]}
      sections={[
        {
          heading: "When Community Care may apply",
          body: "VA may authorize eligible veterans to receive care from community providers in circumstances that include service availability, access standards, best medical interest, and other eligibility criteria. VA approval is generally required before non-emergency community care.",
        },
        {
          heading: "Current mental health access standard",
          body: "VA currently identifies a 30-minute average drive-time or 20-day wait-time standard for mental health care. Meeting an access standard does not by itself create an authorization; VA still determines Community Care eligibility and the approved care pathway.",
        },
        {
          heading: "Common barriers",
          cards: [
            { title: "Referral confusion", body: "It is not always clear which step is pending or who owns it." },
            { title: "Appointment delays", body: "Scheduling can stall after a referral is entered." },
            { title: "Provider availability", body: "Network capacity can affect how quickly care can begin." },
            { title: "Authorization questions", body: "The approved provider, services, dates, or visit scope may need clarification." },
            { title: "Communication gaps", body: "Information can fall between VA, administrators, and community providers." },
            { title: "Unclear next question", body: "Identifying whether the referral, authorization, provider, or scheduling step is stalled can make follow-up more specific." },
          ],
        },
        {
          heading: "How ValorWell fits",
          body: "ValorWell can provide mental health care when an applicable Community Care authorization and the clinical requirements for treatment are in place. VA determines Community Care eligibility, referrals, authorization, and payment scope.",
        },
        {
          heading: "What veterans can prepare",
          bullets: [
            "Any VA referral or authorization information, if applicable.",
            "Current provider information, if you have one.",
            "The approved services, date range, or visit information shown on an authorization.",
            "Treatment goals in your own words.",
            "Relevant treatment records you already have.",
            "Specific questions about the access barrier you are running into.",
          ],
        },
      ]}
      faqs={[
        {
          question: "What is VA Community Care?",
          answer:
            "VA Community Care allows eligible veterans to receive authorized care from non-VA providers in certain circumstances. VA determines eligibility and authorization.",
        },
        {
          question: "Can veterans receive mental health care through Community Care?",
          answer:
            "Yes. Mental health care can be authorized through Community Care for eligible veterans when the required VA pathway is in place.",
        },
        {
          question: "Do I need VA approval?",
          answer:
            "VA generally requires approval before you receive Community Care, except for specified urgent or emergency situations. Confirm the referral and authorization status for your situation before relying on Community Care for payment.",
        },
        {
          question: "Does ValorWell determine Community Care eligibility or authorization?",
          answer:
            "No. VA determines eligibility, referral, authorization, and approved scope. ValorWell can determine whether it has an appropriate clinician and treatment path once the required authorization information is available.",
        },
        {
          question: "What if I am waiting months?",
          answer:
            "VA currently lists a 20-day wait-time access standard for mental health care. Use the Community Care resources to identify the status of the referral, authorization, and scheduling steps, then follow up with the responsible VA source about your specific eligibility and next step.",
        },
        {
          question: "Can telehealth be used?",
          answer:
            "Telehealth may be available depending on authorization, state, clinician licensure, availability, capacity, and clinical fit.",
        },
        {
          question: "What documentation should I keep?",
          answer:
            "Keep referrals, authorizations, appointment information, and relevant communication from VA, Community Care administrators, and providers. Those records can help clarify what has already happened and what is still missing.",
        },
        { question: "What if I am in crisis?", answer: CRISIS_NOTE },
      ]}
      related={[
        { name: "Veteran Mental Health Care", href: "/veteran-mental-health-care", body: "See the broader ValorWell care approach for veterans." },
        { name: "Clinical Documentation Resources", href: "/resources/documentation", body: "Understand treatment records, functional impact, and documentation boundaries." },
        { name: "VA Community Care Resources", href: "/resources/va-community-care", body: "Use the practical resource category for referrals, authorization, and records to keep." },
      ]}
      finalCTAs={[
        { label: "Find Current Care Options", to: "/get-care" },
        { label: "Support ValorWell", to: "/support", variant: "secondary" },
      ]}
      finalNote="VA processes, eligibility, and authorization requirements can change. Verify current specifics with VA for your situation."
    />
  );
}
