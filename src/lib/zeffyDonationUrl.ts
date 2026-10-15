const FORM_URL = "https://www.zeffy.com/embed/donation-form/the-valorwell-bridge-fund?modal=true";

// Zeffy documents source reporting on donation forms via UTM_source. Restrict
// outbound values to channel names: never forward click IDs, arbitrary local
// storage, names, URLs, campaign text or an invented checkout token.
const CHANNELS = new Set([
  "google", "bing", "facebook", "instagram", "linkedin", "youtube",
  "newsletter", "email", "website", "direct", "tiktok", "reddit",
]);

export function createZeffyDonationFormUrl(acquisitionSource?: unknown): string {
  const source = typeof acquisitionSource === "string" ? acquisitionSource.trim().toLowerCase() : "";
  const url = new URL(FORM_URL);
  url.searchParams.set("UTM_source", CHANNELS.has(source) ? source : "website");
  return url.toString();
}

export const ZEFFY_DONATION_FORM_URL = createZeffyDonationFormUrl();
