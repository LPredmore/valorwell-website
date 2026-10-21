# Sitewide Google form tracking

## Purpose

ValorWell uses one website-level form tracking contract. Creating a new Google
Ads conversion for an already registered form must not require another website
conversion snippet or another hardcoded Ads conversion label.

The shared Google tag is installed once in `index.html`. Two independent
signals exist, and they must never share an event name:

1. **Google's automatic form detection** emits `form_start` and `form_submit`
   on submit *attempt*. This is what Google Ads' guided conversion setup
   ("open the page, submit the form, Ads acknowledges it") detects. Leave it
   enabled.
2. **The website's own confirmed-success events**, emitted only after the
   backend confirms the submission actually succeeded:
   - the standard event `vw_form_success`
   - one stable event unique to that form

The website deliberately does **not** emit `form_submit` itself. Doing so would
duplicate Google's automatic event and double-count every conversion built on
the auto-detected form.

Confirmed-success events include stable form metadata such as `form_id` and
`form_name`, but never submitted person names, email addresses, phone numbers,
form-field values, query strings, fragments, or `user_data`.

## Registered forms

| Form | Path | Direct URL | Stable HTML id | Stable HTML name | Stable event |
| --- | --- | --- | --- | --- | --- |
| Client account signup | `/get-care` | `/get-care?signup=1` | `valorwell-get-care-signup` | `valorwell_get_care_signup` | `client_signup_success` |
| Clinician interest | `/clinicians` | `/clinicians` | `valorwell-clinician-interest` | `valorwell_clinician_interest` | `vw_form_submit_clinician` |
| Overflow referral practice | `/clinicians` | `/clinicians` | `valorwell-overflow-referral` | `valorwell_overflow_referral` | `vw_form_submit_overflow` |
| BTY guest application | `/beyondtheyellow` | `/beyondtheyellow?form=guest` | `valorwell-bty-guest-application` | `valorwell_bty_guest_application` | `vw_form_submit_bty_guest` |
| BTY nomination | `/beyondtheyellow` | `/beyondtheyellow?form=nomination` | `valorwell-bty-nomination` | `valorwell_bty_nomination` | `vw_form_submit_bty_nomination` |
| OCS routing | `/operation-claims-success` | `/operation-claims-success?form=routing` | `valorwell-ocs-routing` | `valorwell_ocs_routing` | `vw_form_submit_ocs` |

The direct URLs open or scroll to the form on load, so Google Ads' conversion
wizard can reach a live form without any clicking.

`SitewideFormTrackingManager` assigns the same IDs and names to forms rendered
later inside dialogs, conditional sections, or collapsible panels. Any public
form that is not registered still receives a generated stable id and name
derived from its route (`valorwell-<route>-form`), and logs a development
warning so it can be added to `PUBLIC_FORMS`.

## Success boundary

The confirmed-success events are emitted only after the application confirms
success, not merely because a visitor clicked a submit button.

- Get Care requires `conversionEligible === true` from Billing Hub.
- Clinician interest requires `response.ok === true`.
- BTY, OCS, and overflow referral forms require successful RPC completion.
- Client-side validation and backend failures do not emit `vw_form_success`.

Google's automatic `form_submit` fires on attempt regardless of outcome. That
is inherent to the auto-detection Google Ads uses. Use `vw_form_success` in
Google Analytics to measure true completion rate.

## Required Google account configuration

`index.html` configures the shared Google tag for one Analytics property and
two Google Ads accounts:

```text
G-H5X3D2DGKB     Analytics property
AW-16798905432   ValorWell Foundation, customer 691-549-0774 (donate conversion)
AW-6832312938    Ads account used for form-conversion setup
```

Google Ads' guided form detection only acknowledges a form when the page
carries a Google tag for the **same** Ads account the wizard is running in.
Adding an Ads account to the wizard therefore requires adding its
`gtag("config", "AW-…")` line here first.

No canonical Ads account has been chosen yet. Once one owns all conversions,
remove the other `gtag("config", "AW-…")` line so reporting is not split.

Keep automatic **Form interactions** collection **enabled** in the Analytics web
stream / Google tag automatic-event settings. Google Ads' guided form-conversion
setup depends on it.

## Creating a Google Ads conversion with guided detection

1. Confirm the Ads account you are in has a `gtag("config", …)` line in
   `index.html`, and that the site has been published since it was added.
2. Google Ads → Goals → Conversions → New conversion action → Website.
3. Enter the direct URL for the form from the table above.
4. Choose the form-submission detection option, submit the form in the wizard's
   window, and accept the detected form.
5. Repeat per form using each direct URL.

Alternatively, a conversion can still be imported from the Analytics property
using `vw_form_success` (all successful public forms) or a form's stable event.

Direct Ads conversion-action hits for explicitly supplied conversion labels
are sent from existing confirmed-success handlers (currently client signup and
clinician interest); they are **not** separate global tag loaders or snippets
pasted into page markup. Do not add a second copy of these events to the form.
Do not use page-load conversions as substitutes for successful submissions.

## Verification

After production publish:

1. Open Tag Assistant on the relevant direct URL.
2. Confirm the form has the stable HTML id and name from the table.
3. Submit successfully and confirm exactly one automatic `form_submit`, one
   `vw_form_success`, and one stable per-form event.
4. Trigger a validation or backend failure and confirm no `vw_form_success`.
5. Confirm the event payload contains no submitted field values.
