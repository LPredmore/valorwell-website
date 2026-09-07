import { AuthorityPage } from "@/components/authority/AuthorityPage";

export default function ResourcesVACommunityCare() {
  return (
    <AuthorityPage
      title="VA Community Care Mental Health Resources"
      description="Plain-language resources for veterans navigating VA Community Care mental health referrals, authorization, access barriers, and documentation to keep."
      canonical="/resources/va-community-care"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Resources", url: "/resources" },
        { name: "VA Community Care", url: "/resources/va-community-care" },
      ]}
      eyebrow="Resource Category"
      h1="VA Community Care Mental Health Resources"
      subhead="A practical starting point for veterans trying to understand the moving parts around referrals, authorization, and community mental health care."
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
          . VA identifies a 30-minute average drive-time or 20-day wait-time access standard for mental health care and generally requires VA approval before non-emergency community care.
        </>
      }
      sections={[
        {
          heading: "Use this category for",
          bullets: [
            "Understanding the difference between a referral, authorization, and an actual scheduled appointment",
            "Keeping track of dates, calls, authorization information, approved services, and provider details",
            "Knowing what questions to ask when a Community Care pathway stalls",
            "Thinking through telehealth and community-provider options",
            "Recognizing when a provider can treat you but may not currently have the authorization needed to bill VA Community Care",
            "Separating provider care decisions from VA eligibility and authorization decisions",
          ],
        },
        {
          heading: "Current Community Care basics",
          bullets: [
            "VA generally requires approval from the Veteran's VA health care team before community care, except for specified urgent or emergency situations.",
            "For mental health care, VA's designated access standard is a 30-minute average drive time or a 20-day wait time.",
            "A Community Care authorization defines the approved care; additional or extended services may require further VA approval.",
          ],
        },
        {
          heading: "Verify current rules and authorization",
          body: "Community Care eligibility, authorization, referral status, network participation, and administrative requirements can change and can vary by circumstance. Use these resources to understand the process and organize your questions, then verify current status with VA and the authorized community provider before relying on it for care or payment.",
        },
      ]}
      related={[
        { name: "Clinical Documentation Resources", href: "/resources/documentation", body: "Understand treatment records, documentation boundaries, and what to keep." },
        { name: "Veteran Mental Health Resources", href: "/resources/veteran-mental-health", body: "Care access, PTSD support, family strain, telehealth, and when to seek help." },
        { name: "Find Care", href: "/get-care", body: "See the care pathways ValorWell currently supports." },
      ]}
      finalCTAs={[
        { label: "Find Care", to: "/get-care" },
        { label: "Explore All Resources", to: "/resources", variant: "secondary" },
      ]}
    />
  );
}
