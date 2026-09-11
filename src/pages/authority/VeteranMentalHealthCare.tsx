import { AuthorityPage, CRISIS_NOTE } from "@/components/authority/AuthorityPage";

export default function VeteranMentalHealthCare() {
  return (
    <AuthorityPage
      title="Veteran Mental Health Care | Therapy and Support for Veterans"
      description="ValorWell helps veterans access mental health care, treatment documentation, family-aware support, and care-navigation education through available telehealth pathways."
      canonical="/veteran-mental-health-care"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Veteran Mental Health Care", url: "/veteran-mental-health-care" },
      ]}
      eyebrow="Veteran Mental Health Care"
      h1="Mental health care for veterans who need more than another waiting list."
      subhead="ValorWell provides telehealth mental health care for veterans when coverage or authorization, clinician licensure, availability, capacity, and clinical fit align."
      heroCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Support ValorWell", to: "/impact", variant: "secondary" },
      ]}
      sections={[
        {
          heading: "Treatment can involve more than the appointment itself",
          body: "Veterans may be navigating trauma, transition, family stress, care delays, VA access issues, and multiple health systems at the same time. Treatment records can also matter for continuity of care when symptoms, assessment, interventions, functional impact, and progress need to be understood across providers.",
        },
        {
          heading: "What ValorWell helps with",
          cards: [
            { title: "Individual therapy", body: "One-on-one care with licensed clinicians." },
            { title: "Trauma and stress support", body: "Treatment approaches selected for the individual clinical situation." },
            { title: "PTSD-related concerns", body: "Assessment and treatment of trauma-related symptoms when clinically appropriate." },
            { title: "Family and relationship strain", body: "Care that can account for family and relationship context." },
            { title: "Emotional regulation", body: "Skills and treatment strategies selected with the treating clinician." },
            { title: "Care navigation education", body: "Information that can help make the current care system easier to understand." },
            { title: "Treatment documentation", body: "Records that reflect assessment, treatment, and clinician judgment." },
            { title: "Telehealth access", body: "Remote outpatient care when the applicable care pathway and clinical requirements align." },
          ],
        },
        {
          heading: "Why access can be difficult",
          body: "Waitlists, provider availability, coverage rules, authorization, and fragmented handoffs can all delay treatment. The useful next step depends on identifying which part of the care pathway is actually blocking access.",
        },
        {
          heading: "Clinical scope",
          bullets: [
            "Treatment decisions remain with appropriately licensed treating clinicians.",
            "Documentation reflects the care, assessment, and information available to the clinician.",
            "Telehealth care depends on state licensure, availability, capacity, and clinical fit.",
            "Coverage and authorization requirements remain part of the applicable care pathway.",
            "ValorWell does not determine VA disability ratings, service connection, or claim outcomes.",
          ],
        },
      ]}
      faqs={[
        {
          question: "Does ValorWell work with veterans?",
          answer:
            "Yes. Veterans and military-connected families are the core population ValorWell serves through its current care pathways.",
        },
        {
          question: "Is care available by telehealth?",
          answer:
            "Telehealth is ValorWell's primary care-delivery format. Availability depends on state licensure, coverage or authorization, clinician availability, capacity, and clinical fit.",
        },
        {
          question: "Can ValorWell help with PTSD-related concerns?",
          answer:
            "ValorWell clinicians can assess and treat trauma-related concerns within their licensure, scope, training, and clinical judgment.",
        },
        {
          question: "What can treatment records document?",
          answer:
            "Treatment records can document clinically relevant symptoms, history, assessment, interventions, functional impact, progress, and plan of care. The content of an individual record is determined by the treating clinician and the care provided.",
        },
        {
          question: "Does ValorWell determine VA disability outcomes?",
          answer:
            "No. VA determines disability ratings, service connection, and claim outcomes. ValorWell provides clinical care and treatment records; it does not make those administrative decisions.",
        },
        { question: "What should I do if I am in crisis?", answer: CRISIS_NOTE },
      ]}
      related={[
        { name: "Military Family Therapy", href: "/military-family-therapy", body: "Support for spouses, family members, and household strain when an appropriate care path is available." },
        { name: "Clinical Documentation Resources", href: "/resources/documentation", body: "Understand treatment records, functional impact, and documentation boundaries." },
        { name: "CHAMPVA Resources", href: "/resources/champva", body: "Provider access, assignment, authorization basics, and current CHAMPVA care information." },
        { name: "VA Community Care Resources", href: "/resources/va-community-care", body: "Understand referrals, authorization, access standards, and records to keep." },
      ]}
      finalCTAs={[
        { label: "Start Care with ValorWell", to: "/get-care" },
        { label: "Explore Veteran Mental Health Resources", to: "/resources/veteran-mental-health", variant: "secondary" },
      ]}
      finalNote={CRISIS_NOTE}
    />
  );
}
