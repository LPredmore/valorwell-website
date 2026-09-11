import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
}

const SITE_NAME = "ValorWell";
const DEFAULT_TITLE =
  "ValorWell | Mental Health Care for Veterans & Military Families";
const DEFAULT_DESCRIPTION =
  "ValorWell provides telehealth mental health care pathways for veterans and military families, funds therapy when access breaks down, and connects communities through Beyond The Yellow.";
const SITE_URL = "https://valorwell.org";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

function buildPageTitle(title?: string) {
  if (!title) return DEFAULT_TITLE;
  return /\bValorWell\b/i.test(title) ? title : `${title} | ${SITE_NAME}`;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = "website",
  image = DEFAULT_IMAGE,
  noIndex = false,
}: SEOProps) {
  const fullTitle = buildPageTitle(title);
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "ValorWell",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/valorwell-logo.png`,
    description:
      "ValorWell provides telehealth mental health care pathways for veterans and military families, supports donor-funded therapy through the ValorWell Foundation, and connects communities through Beyond The Yellow.",
    sameAs: ["https://www.youtube.com/@ValorWell"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@valorwell.org",
      contactType: "general inquiries",
      availableLanguage: "English",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function MedicalOrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "ValorWell",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/valorwell-logo.png`,
    description:
      "Telehealth mental health care for veterans and military families, subject to coverage or authorization, clinician licensure, availability, capacity, and clinical fit.",
    medicalSpecialty: "Mental Health",
    availableService: [
      {
        "@type": "MedicalTherapy",
        name: "Telehealth Mental Health Therapy",
        description:
          "Outpatient telehealth mental health therapy provided where coverage or authorization, state licensure, clinician availability, capacity, and clinical fit align.",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Veterans and Military Families",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function ServiceSchema({ name, description, url }: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: {
      "@type": "Organization",
      name: "ValorWell",
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Veterans and Military Families",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function JobPostingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Licensed Mental Health Therapist",
    description:
      "Join ValorWell as a licensed mental-health clinician serving veterans and military families. Telehealth-first 1099 work, $75 per completed session, weekly pay, flexible availability, billing support, and clinical autonomy.",
    hiringOrganization: {
      "@type": "Organization",
      name: "ValorWell",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/brand/valorwell-logo.png`,
    },
    employmentType: "CONTRACTOR",
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "United States",
    },
    datePosted: "2026-07-19",
    validThrough: "2026-12-31",
    qualifications:
      "Licensed mental health clinician (LCSW, LPC, LMFT, or Psychologist). Experience with trauma-informed care preferred.",
    responsibilities:
      "Provide telehealth mental-health care within the clinician's license and scope, complete timely clinical documentation, and support veteran and military-family care pathways.",
    industry: "Mental Health Care",
    occupationalCategory: "Mental Health Counselors",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function NonprofitOrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${SITE_URL}/foundation#foundation`,
    name: "ValorWell Foundation",
    url: `${SITE_URL}/foundation`,
    logo: `${SITE_URL}/brand/valorwell-logo.png`,
    taxID: "93-3129745",
    description:
      "The ValorWell Foundation supports donor-funded mental health therapy for veterans who sought care but still could not reach an available treatment path.",
    foundingDate: "2024-05-13",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    knowsAbout: [
      "Veteran mental health",
      "Mental health care access",
      "Donor-funded therapy",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function DonateActionSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: "Support Donor-Funded Mental Health Therapy for Veterans",
    description:
      "Donations to the ValorWell Foundation help fund direct mental health therapy for veterans who sought care but still could not reach an available treatment path.",
    recipient: {
      "@type": "NGO",
      name: "ValorWell Foundation",
      url: `${SITE_URL}/foundation`,
      description:
        "A nonprofit organization supporting donor-funded mental health therapy for veterans.",
      areaServed: {
        "@type": "Country",
        name: "United States",
      },
    },
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/donate`,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface VideoSchemaProps {
  name: string;
  description: string;
  embedUrl: string;
  thumbnailUrl?: string;
  uploadDate?: string;
}

export function VideoObjectSchema({
  name,
  description,
  embedUrl,
  thumbnailUrl,
  uploadDate,
}: VideoSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    embedUrl,
    thumbnailUrl: thumbnailUrl || `${SITE_URL}/og-image.png`,
    ...(uploadDate ? { uploadDate } : {}),
    publisher: {
      "@type": "Organization",
      name: "ValorWell",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/valorwell-logo.png`,
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
