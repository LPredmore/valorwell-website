# Project rules

- Build scripts read Billing Hub through `scripts/fetch-with-retry.mjs` (bounded retries on timeouts/5xx, then fail). Why: Billing Hub is shared and has brief outages, and the build must never ship with the Resources pages missing.
- Public form edge functions return an explicit `result` (persisted / verified_duplicate / key_conflict / validation_failed / indeterminate), verify duplicates against the stored row, send at most one hourly outage alert, and log no personal details; the site counts conversions only on persisted or verified_duplicate (contract in docs/clinician-intake-reliability.md). Why: an unconfirmed write must never be reported or tracked as a completed registration.
