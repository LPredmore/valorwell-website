# Project rules

- Build scripts read Billing Hub through `scripts/fetch-with-retry.mjs` (bounded retries on timeouts/5xx, then fail). Why: Billing Hub is shared and has brief outages, and the build must never ship with the Resources pages missing.
- Public form edge functions return `retryable` + a 503 when the database is unavailable, alert info@valorwell.org, and log only the submission key (no personal details). Why: an applicant must never be told a failed save succeeded, and staff must be able to follow up.
