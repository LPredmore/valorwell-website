import { AuthorityPage } from "@/components/authority/AuthorityPage";

export default function ResourcesChampva() {
  return (
    <AuthorityPage
      title="CHAMPVA Mental Health Resources"
      description="Practical CHAMPVA mental health resources for families navigating provider access, telehealth, questions to ask, and care barriers."
      canonical="/resources/champva"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resources", url: "/resources" },
        { name: "CHAMPVA", url: "/resources/champva" },
      ]}
      eyebrow="Resource Category"
      h1="CHAMPVA Mental Health Resources"
      subhead="A starting point for CHAMPVA-connected families trying to find and use mental health care without pretending the process is simpler than it is."
      lastReviewed="September 6, 2026"
      sourceNote={
        <>
          Primary source: {" "}
          <a
            href="https://www.va.gov/resources/champva-care/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            VA CHAMPVA care
          </a>
          . VA states that CHAMPVA has no specific provider network, recommends asking whether a provider accepts CHAMPVA assignment, covers mental health care, and generally does not require prior authorization except for specified services such as inpatient mental health and substance-use care.
        </>
      }
      sections={[
        {
          heading: "Use this category for",
          bullets: [
            "Finding mental health providers who will work with CHAMPVA",
            "Asking whether a provider accepts CHAMPVA assignment before scheduling",
            "Understanding common access and participation barriers",
            "Thinking through telehealth as a care option",
            "Keeping track of the information you receive from providers and CHAMPVA",
            "Knowing when the fastest useful next step is to ask ValorWell about current care availability",
          ],
        },
        {
          heading: "Current CHAMPVA basics",
          bullets: [
            "VA does not maintain a specific network of CHAMPVA providers.",
            "CHAMPVA covers mental health care, subject to the program's benefit rules and cost sharing.",
            "VA says most CHAMPVA care does not require prior authorization; specified services, including inpatient mental health and substance-use care, do require approval.",
          ],
        },
        {
          heading: "Verify the details that can change",
          body: "Coverage rules, provider participation, billing practices, and administrative requirements can change. Use these resources to understand the problem and the questions to ask, then verify current benefit and provider information with VA and the provider before making a care or financial decision.",
        },
      ]}
      related={[
        { name: "Find Care", href: "/get-care", body: "See the care pathways ValorWell currently supports." },
        { name: "VA Community Care Resources", href: "/resources/va-community-care", body: "A separate pathway for eligible veterans navigating VA-authorized community care." },
        { name: "All Resources", href: "/resources", body: "Return to the full ValorWell resource hub." },
      ]}
      finalCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Support ValorWell", to: "/support", variant: "secondary" },
      ]}
    />
  );
}
