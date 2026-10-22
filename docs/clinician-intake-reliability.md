# Clinician interest intake: reliability contract

## Website → Billing Hub (`register-clinician-interest`)

The form sends `submissionKey`, created once per logical submission and reused on
every retry. A new key is created only after a confirmed save, or when the server
returns `newKeyRequired: true`.

| `result` | HTTP | Meaning | Website counts a lead? |
| --- | --- | --- | --- |
| `persisted` | 200 | New `website_submissions` row written and its id returned | yes |
| `verified_duplicate` | 200 | A row with this key already exists for the same applicant (type, name, email match) | yes |
| `key_conflict` | 409 | The key exists but belongs to someone else; the form starts a new key | no |
| `validation_failed` | 400/422 | Bad input, or the database rejected the row | no |
| `indeterminate` | 503/500 | Database unreachable; the write could not be confirmed | no |

`lifecycle` is now `interest_recorded`. The old value, `invite_sent`, claimed an
invitation had been sent, and the function never verified that.

Routine logs are JSON lines containing `requestId`, `submissionKey`, `stage`,
`result`, `category`, `code`, `httpStatus` and `recovery`. They never contain
names or emails. Outage alerts go to info@valorwell.org through Resend, with an
`Idempotency-Key` per UTC hour, so at most one email is sent per hour.

## Required from Billing Hub / CRM (not verifiable from this repo)

1. **Unique index:**
   `UNIQUE (tenant_id, source_system, source_record_key) WHERE source_record_key IS NOT NULL`
   on `website_submissions`. I could not confirm it exists while the database was
   down. The function relies on it for duplicate protection.
2. **Downstream processing:** after insert, the row's `status` and
   `provider_applicant_id` are expected to be set by CRM processing. That code is
   not in this repo. The CRM must:
   - process rows idempotently, keyed by `website_submissions.id`;
   - leave a failed row in a retryable status, never delete it;
   - give staff a view of rows where `provider_applicant_id IS NULL` past an agreed delay.
3. **Outage reconciliation:** search the function logs for `"result":"indeterminate"`
   and check each `submissionKey` against `source_record_key`.

## Durable fallback queue (awaiting approval; not built)

A queue inside Billing Hub does not help, because it fails with the database.
Proposed design:

- **Where:** a Cloudflare Worker with a D1 database or Queue, deployed from the
  existing `wrangler.jsonc` account. It is independent of Supabase. D1 data is
  encrypted at rest, and all traffic uses TLS.
- **Flow:**
  1. Billing Hub returns `indeterminate`.
  2. The browser sends the same payload and key to the Worker.
  3. The Worker stores it and returns `queued`.
  4. The form shows "Received. We'll finish registering you shortly". It does
     not say "registered".
  5. A cron runs every 5 minutes and replays queued rows through
     `register-clinician-interest`, using the same key.
  6. A row is marked complete only on `persisted` or `verified_duplicate`.
  7. After 24 hours of failure, the Worker sends an alert.
- **Security:**
  - write-only public endpoint, protected by the honeypot plus Turnstile;
  - replay and admin use a secret token;
  - stores only name, email, consent and key;
  - deletes rows 30 days after completion;
  - routine logs carry no personal information.
- **Cost:** likely $0 within Cloudflare's free tier (Workers, D1, Cron) at
  ValorWell's volume. The Workers Paid plan is $5/month if limits are exceeded.
- **Needs:** approval, plus confirmation that the Cloudflare account and an API
  token can be used.
