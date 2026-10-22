# Billing Hub database outage: findings and repair plan (website side)

## What I found so far
- The shared Billing Hub database is not answering right now. Simple requests time out after 30 to 40 seconds, and Lovable's own database tools report that the connection pool is unavailable. That is why the website build fails at the step that downloads Resources pages. It is not a website code bug.
- Most of the incident brief is about code that lives somewhere else: the CRM reply-deadline function (PR #219), Gmail sync, the cron jobs, and database sizing all belong to the `valorwell-crm` repo and the Supabase dashboard. This project can't see or merge that PR, can't read the cron jobs or resource charts while the database is down, and can't change compute size.
- The clinician application already works the right way. If saving fails, the applicant sees an error instead of a false "success". A repeated submission with the same key is treated as one submission, so it doesn't create a duplicate.

## What I will change in this project
1. **Resources download that survives short outages** (`scripts/generate-resource-content.mjs`)
   - Every request gets a time limit and up to 4 retries with growing waits (about 2, 4, 8 and 16 seconds), but only for timeouts and 502/503/504 errors.
   - If it still fails, the build still stops with a clear message. It never publishes without the Resources pages and never uses old pages silently.
2. **Clinician application: easier to check and to recover** (`register-clinician-interest` and its form)
   - The form creates one submission key and reuses it when the applicant retries, so retrying after a timeout can't create a duplicate.
   - When the database is unavailable (timeouts, 5xx errors, the PGRST002 schema-cache error), the applicant gets a clear "please try again in a few minutes" message, and staff are alerted with an email to info@valorwell.org through the existing Resend setup.
   - Each failure is logged with its submission key and the error type, so missed submissions during the outage can be found later. Personal details are not written to the logs.
3. **Same check on the scheduler** (`bty-scheduler`)
   - Confirm that a failed save is never shown to the guest as a confirmed booking, and add the same "database unavailable" handling.
4. **Tests** for the retry rules, reusing the submission key, and the "try again" message.

## Blocked, or outside this project (handed to you or Codex)
- Reviewing, merging and applying PR #219 (the CRM reply-deadline fix): CRM repo, and it needs the database back.
- Gmail notification retries, failed-message handling and resume points: CRM repo.
- Checking the cron jobs, connection count, slow queries and compute size: needs the database reachable and access to the Supabase dashboard. I'll run the read-only checks once it responds.
- Checking for applications lost during the outage: compare the edge function logs from Oct 22 with the `website_submissions` rows after recovery.

## Not doing
- No database changes, no data deletion, no restart, no paid upgrade. The Invitation to Interview campaign stays off.
