# Roadmap — /therapistapplication incremental qualification flow

- [x] Migration: therapist_applications, therapist_application_codes, therapist_application_invites (grants + RLS, service-role only) + npi_declared column
- [x] Edge function therapist-application (request_code / verify_code / session / save / complete / send_pending_invites) — deployed and live-verified
- [x] register-clinician-interest: durable invite outbox + Resend send on new persisted submissions only — deployed
- [x] Frontend: src/lib/therapistApplication.ts + src/pages/TherapistApplicationPage.tsx (email gate → 3 steps → done)
- [x] Routes: core-routes.mjs + AppRoutes.tsx (/therapistapplication, noindex, no sitemap)
- [x] Tests: NPI Luhn, email gate logic, multi-state mapping, no-duplicate invites, no campaign/provider_applicants writes guardrail — 169 pass
- [x] Verify: typecheck, lint, tests, build (342 routes) all pass

Open item (user action): add CRON_SECRET secret + a 1-minute cron calling send_pending_invites if automatic invite retries are wanted (failed invites also retry on duplicate submissions).
