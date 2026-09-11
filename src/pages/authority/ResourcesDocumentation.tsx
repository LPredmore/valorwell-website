import { AuthorityPage } from "@/components/authority/AuthorityPage";

export default function ResourcesDocumentation() {
  return (
    <AuthorityPage
      title="Clinical Documentation Resources for Veterans"
      description="Resources on treatment records, clinical documentation, functional impact, continuity of care, and the boundaries between clinical records and administrative decisions."
      canonical="/resources/documentation"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resources", url: "/resources" },
        { name: "Documentation", url: "/resources/documentation" },
      ]}
      eyebrow="Resource Category"
      h1="Clinical Documentation Resources for Veterans"
      subhead="Understand what treatment records can contain, how they support continuity of care, and where clinical documentation ends and administrative decision-making begins."
      sections={[
        {
          heading: "Use this category for",
          bullets: [
            "Understanding how treatment records are created as part of clinical care",
            "Learning the kinds of symptoms, history, assessment, interventions, functional impact, progress, and plans a record may contain",
            "Understanding how records can support continuity when care involves multiple clinicians or health systems",
            "Knowing why documentation varies by clinical situation, provider, setting, and treatment provided",
            "Keeping copies of relevant records organized when multiple systems are involved",
            "Separating a clinician's treatment record from decisions made by VA, insurers, employers, courts, or other administrative systems",
          ],
        },
        {
          heading: "What determines the record",
          body: "Clinical documentation reflects the care provided, the information available to the clinician, applicable documentation requirements, and the clinician's professional assessment and judgment. Not every record will contain the same level of detail or address the same questions.",
        },
        {
          heading: "Clinical records and administrative outcomes are different",
          body: "A treatment record may be reviewed by another health system or administrative program, but the treating clinician does not control how that outside organization evaluates it. VA disability ratings, service connection, insurance decisions, legal determinations, and similar outcomes are made by the responsible organization under its own rules.",
        },
      ]}
      related={[
        { name: "Veteran Mental Health Resources", href: "/resources/veteran-mental-health", body: "Care access, PTSD-related concerns, family strain, telehealth, and when to seek help." },
        { name: "Find Care", href: "/get-care", body: "See the care pathways ValorWell currently supports." },
        { name: "All Resources", href: "/resources", body: "Return to the full ValorWell resource hub." },
      ]}
      finalCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Support ValorWell", to: "/impact", variant: "secondary" },
      ]}
      finalNote="The content of an individual treatment record is determined by the care provided, applicable requirements, and the treating clinician's professional judgment."
    />
  );
}
