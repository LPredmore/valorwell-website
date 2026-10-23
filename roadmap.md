# Roadmap — /therapistapplication incremental qualification flow

- [ ] Migration: therapist_applications, therapist_application_codes, therapist_application_invites (grants + RLS, service-role only)
- [ ] Edge function therapist-application (request_code / verify_code / save / complete / send_pending_invites)
- [ ] register-clinician-interest: durable invite outbox + Resend send on new persisted submissions only
- [ ] Frontend: src/lib/therapistApplication.ts + src/pages/TherapistApplicationPage.tsx (email gate → 3 steps → done)
- [ ] Routes: core-routes.mjs + AppRoutes.tsx (/therapistapplication, noindex, no sitemap)
- [ ] Tests: NPI Luhn, email gate logic, multi-state mapping, no-duplicate invites, no campaign/provider_applicants writes guardrail
- [ ] Verify: typecheck, lint, tests, build; report blockers honestly
