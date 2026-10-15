# Zeffy donation source collection

The existing Bridge Fund modal and Donation form opened Google Ads intent action are preserved. Donation links now pass Zeffy's documented `UTM_source` parameter, using the stored acquisition channel when it is a known channel name and `website` otherwise. CTA placement remains in the existing analytics metadata; it never replaces a known acquisition source.

Only the channel is handed off. No click IDs, donor names/email, arbitrary UTM text, landing/referrer URLs or fabricated payment/checkout token are appended. The fixed donation form/modal URL remains authoritative. Unknown sources intentionally collapse to website rather than forwarding arbitrary local storage.

Provider source: https://support.zeffy.com/utm-tracking-on-zeffy-forms-sbfs5 . Zeffy documents source visibility in successful donation details/exports, like a custom-question answer. This is source collection, not proof of persistence through this embed, a known API question label or individual ad attribution. Do not guess the question label or match donations by email/time. Payment metadata is reserved in https://api.zeffy.com/api/docs .

Actual donations/amounts remain separate authenticated Zeffy ledger facts in Billing Hub. Individual matching requires a supported opaque checkout reference round trip plus consented first-party click capture; no such contract is established here. No completed-donation conversion or Ads upload was added. Existing intent tracking code is unchanged.

Prepared URL/CTA fixtures, NOT RUN. All tests/lint/type/build/browser acceptance are deferred under CRM task 42. Verify final form/modal/native fallback URLs, source display in a controlled completed donation/export, existing intent deduplication and no raw click data outbound. No payment or provider API request was made. Deployment evidence is recorded separately; a source merge is not behavioral verification.
