import { AuthorityPage } from "@/components/authority/AuthorityPage";

export default function ResourcesChampva() {
  return (
    <AuthorityPage
      title="CHAMPVA Mental Health Resources"
      description="Practical CHAMPVA mental health resources for families navigating provider access, telehealth, assignment, preauthorization questions, and care barriers."
      canonical="/resources/champva"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resources", url: "/resources" },
        { name: "CHAMPVA", url: "/resources/champva" },
      ]}
      eyebrow="Resource Category"
      h1="CHAMPVA Mental Health Resources"
      subhead="A starting point for CHAMPVA-connected families trying to understand provider participation, mental health coverage, preauthorization questions, and care access."
      lastReviewed="September 6, 2026"
      sourceNote={
        <>
          Primary VA sources: {" "}
          <a
            href="https://www.va.gov/resources/champva-care/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            CHAMPVA care for beneficiaries
          </a>
          {" "}and {" "}
          <a
            href="https://department.va.gov/vha/community-care/family-member-care/champva/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            CHAMPVA provider guidance
          </a>
          . VA's public materials use different levels of detail when describing mental-health preauthorization. Confirm the specific service with CHAMPVA before relying on coverage or authorization status.
        </>
      }
      sections={[
        {
          heading: "Use this category for",
          bullets: [
            "Finding mental health providers who will work with CHAMPVA",
            "Asking whether a provider accepts CHAMPVA assignment before scheduling",
            "Understanding common access and participation barriers",
            "Knowing what to verify about preauthorization for the specific level of mental health care being considered",
            "Thinking through telehealth as a care option",
            "Keeping track of the information you receive from providers and CHAMPVA",
            "Knowing when the fastest useful next step is to ask ValorWell about current care availability",
          ],
        },
        {
          heading: "Current CHAMPVA basics",
          bullets: [
            "VA does not maintain a specific network of CHAMPVA providers.",
            "VA recommends asking whether a provider accepts CHAMPVA assignment before receiving care.",
            "CHAMPVA covers mental health care, subject to the program's benefit rules, cost sharing, and any applicable preauthorization requirement.",
            "VA's beneficiary page says most CHAMPVA care does not require prior authorization and specifically identifies certain mental health and substance-use services that do. VA's provider guidance describes preauthorization more broadly for mental health and substance-use services. Verify the specific service with CHAMPVA before treatment.",
          ],
        },
        {
          heading: "Verify the details that can change",
          body: "Coverage rules, provider participation, billing practices, and administrative requirements can change. Use these resources to understand the questions to ask, then confirm current benefits, assignment, and any required preauthorization with CHAMPVA and the provider before making a care or financial decision.",
        },
      ]}
      related={[
        { name: "Find Care", href: "/get-care", body: "See the care pathways ValorWell currently supports." },
        { name: "VA Community Care Resources", href: "/resources/va-community-care", body: "A separate pathway for eligible veterans navigating VA-authorized community care." },
        { name: "All Resources", href: "/resources", body: "Return to the full ValorWell resource hub." },
      ]}
      finalCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Support ValorWell", to: "/impact", variant: "secondary" },
      ]}
    />
  );
}
