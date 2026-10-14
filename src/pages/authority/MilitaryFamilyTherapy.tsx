import { AuthorityPage, CRISIS_NOTE } from "@/components/authority/AuthorityPage";

export default function MilitaryFamilyTherapy() {
  return (
    <AuthorityPage
      title="Military Family Therapy and Veteran Family Support"
      description="ValorWell helps veterans and military-connected families address stress, communication, PTSD-related strain, parenting, and family systems."
      canonical="/military-family-therapy"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Military Family Therapy", url: "/military-family-therapy" },
      ]}
      eyebrow="Military Family Therapy"
      h1="Military and veteran families carry stress the system often does not see."
      subhead="ValorWell helps families work through communication, stress, conflict, transition, trauma-related strain, and the real-life impact of military-connected mental health challenges when an appropriate care path is available."
      heroCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Family Resources", to: "/resources", variant: "secondary" },
      ]}
      sections={[
        {
          heading: "Families need support too",
          bullets: [
            "Family members can be affected by trauma and stress, not only the veteran.",
            "Spouses and children may carry responsibilities and uncertainty that other people do not see.",
            "Conflict can become the visible symptom of deeper strain.",
            "Support can include the family system when clinically appropriate and when the care pathway allows it.",
          ],
        },
        {
          heading: "Common issues families may bring to therapy",
          cards: [
            { title: "Communication breakdowns" },
            { title: "Emotional distance" },
            { title: "Anger and irritability" },
            { title: "Parenting strain" },
            { title: "Role changes" },
            { title: "Caregiver stress" },
            { title: "Transition stress" },
            { title: "PTSD-related relationship impact" },
          ],
        },
        {
          heading: "ValorWell's approach",
          bullets: [
            "Practical tools families can use outside the session.",
            "Family-systems thinking when it fits the clinical situation.",
            "Emotional regulation skills.",
            "Communication frameworks.",
            "Therapy based on individual needs and clinical judgment.",
            "Education and support for caregivers when appropriate.",
          ],
        },
        {
          heading: "What happens between sessions matters too",
          body: "Therapy is only one part of the week. Families often benefit from clear routines, shared language, and repeatable ways to approach communication, regulation, and conflict between appointments. The Family Systems resource category provides educational tools for that work without presenting them as a replacement for therapy.",
        },
      ]}
      faqs={[
        {
          question: "Does ValorWell work with spouses and family members?",
          answer:
            "Yes. Veteran family members are part of ValorWell's current public care population when coverage, licensure, clinician availability, capacity, age range, and clinical fit align.",
        },
        {
          question: "Can family members receive support even if the veteran is not in therapy?",
          answer:
            "A family member may pursue care for their own mental health needs even when the veteran in their life is not a ValorWell client, subject to the applicable care pathway and clinical fit.",
        },
        {
          question: "Can telehealth work for family support?",
          answer:
            "Telehealth can be a useful format for some family-related care. Availability depends on where participants are located, clinician licensure, coverage, scheduling, and clinical fit.",
        },
        {
          question: "Can trauma-related symptoms affect relationships and parenting?",
          answer:
            "Trauma-related symptoms can affect sleep, communication, irritability, closeness, routines, and parenting. An individual clinician can assess what is relevant in a specific family's situation.",
        },
        {
          question: "Are family-systems resources a replacement for therapy?",
          answer:
            "No. They are educational tools. Use Find Care when a family member needs clinical assessment or treatment.",
        },
        { question: "What if my family is in crisis?", answer: CRISIS_NOTE },
      ]}
      related={[
        { name: "Family Systems", href: "/family-systems", body: "Understand the educational systems-over-reactions framework." },
        { name: "Veteran Mental Health Resources", href: "/resources/veteran-mental-health", body: "Supporting a Veteran who is struggling, and what to do when a provider isn't a fit." },
        { name: "Veteran Mental Health Care", href: "/veteran-mental-health-care", body: "See the broader ValorWell mental-health care approach for veterans." },
      ]}
      finalCTAs={[
        { label: "Ask About Family Support", to: "/get-care" },
        { label: "Explore Family Resources", to: "/resources", variant: "secondary" },
      ]}
      finalNote={CRISIS_NOTE}
    />
  );
}
