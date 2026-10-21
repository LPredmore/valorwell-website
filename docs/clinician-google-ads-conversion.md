# Clinician Google Ads conversion

Clinician-interest submissions now use the shared sitewide form tracking
contract. See [Sitewide Google form tracking](sitewide-google-form-tracking.md).

A successful clinician-interest registration emits:

- `vw_form_success`
- `vw_form_submit_clinician`

The form has the stable HTML identity:

```text
id: valorwell-clinician-interest
name: valorwell_clinician_interest
```

The events fire only after `register-clinician-interest` returns `ok: true`.
Validation and backend failures do not emit a successful-form event.

## Direct Google Ads conversion

The Ads conversion action supplied for therapist recruiting is
`AW-16798905432/XWcdCMz27tscENjoq8o-` (value 1.0 USD).
It is sent **once per submission ID** from
`src/lib/clinicianConversionTracking.ts`, alongside the shared success events.
The global `gtag.js` loader and the `AW-16798905432` destination are already
configured in `index.html`; do not install a second global tag or paste an
extra event snippet into page markup.

On today's `/clinicians` page, \"Raise My Hand\" only registers **clinician
interest** (name, email and communication consent). It is **not** a completed
credentialing or full therapist application. The Ads action is named
\"Therapist Application Submitted\", but technically measures completion of this
interest form. If the Ads goal should instead measure **final completed
applications**, instrument the downstream application workflow and do not count
these interest submissions under that final-application goal.

The conversion fires only after the backend returns `ok: true`, and the client
excludes honeypot entries, even though the backend intentionally acknowledges
them. Validation and backend errors do not fire the Ads event. The
`transaction_id` is a random submission key, never an email or name.

Google's automatic form-submission detection is a separate attempt-based signal.
Avoid setting an auto-detected conversion for this same form as an additional
**Primary** Ads goal, or Ads could count the same lead twice.

After publishing, use Google Tag Assistant and a legitimate test submission to
check one `conversion` event addressed to the target above, alongside
`vw_form_success` and `vw_form_submit_clinician`. Check Google Ads diagnostics
for receipt; tags being present does not alone prove that Ads processed the hit.
