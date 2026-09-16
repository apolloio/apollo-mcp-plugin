---
name: enrich-lead
description: "Resolve and enrich a lead with Apollo using staged approvals. Use when identifying a person, adding company context, requesting contact details, saving a matched contact, or reviewing one ambiguous lead."
---

# Enrich Lead

Resolve one lead before spending credits, then keep credit use, private-data reveal, and contact writes as separate decisions. Return a seller-facing contact card, not a raw payload.

## 1. Resolve Search-Only Candidates

Parse the available name, company, domain, profile URL, title, or other non-secret identifier. Use `apollo_mixed_people_api_search` to disambiguate when necessary and show at most three candidates with name or masked name, title, company, location, and a confidence note.

Do not show private email addresses or phone numbers during search-only review. If there is no clear match, ask the user to choose or refine a candidate before enrichment.

## 2. Confirm Credit Use

Use `apollo_people_match` only after showing the selected identity. Immediately before the call, use the exact credit-confirmation wording required by the current tool description, replacing its placeholders with the selected person.

Do not enrich until the user explicitly agrees to that credit step. Credit approval does not approve private-data reveal or a contact write.

For optional company context from `apollo_organizations_enrich`, ask the separate exact confirmation required by that tool's current description.

## 3. Confirm Private-Data Reveal

Before offering any email or phone reveal, call `apollo_users_api_profile` once with `include_waterfall_capability: true`. Reuse the returned team-level email and phone capability flags for the rest of the conversation.

- When waterfall is enabled for the requested field, use the matching waterfall option by default and use the exact variable-cost confirmation required by `apollo_people_match`. Never quote a fixed waterfall cost.
- When waterfall is not enabled, use the standard reveal path and its exact confirmation. If the user explicitly requested waterfall, use the tool's required disabled-capability message and run a standard reveal only if the user accepts that alternative.
- Before any phone reveal or waterfall request, verify that `apollo_webhook_result_show` is available. If it is unavailable, do not start the request or spend credits; ask the user to reconnect Apollo.

For a standard personal-email reveal, preview the selected count and ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

Do not reveal those fields without an explicit answer to this separate question. The match still requires the exact 1-credit confirmation immediately before the call. A prior enrichment approval is not reveal approval.

For a standard phone reveal, use the one combined enrichment-and-phone confirmation required by `apollo_people_match`; do not ask for enrichment and phone approval in separate turns. For any accepted asynchronous phone or waterfall request, poll `apollo_webhook_result_show` with the exact top-level request ID and the timing rules in the current tool description. Do not claim a phone number or waterfall result until polling succeeds.

## 4. Present the Result

Show only returned and approved fields: name, title, company, location, profile URL, company domain, company size, company context, and approved contact details. Mark uncertain matches and omit unavailable values. Do not expose internal identifiers unless a separately confirmed next action needs them.

## 5. Confirm Contact Writes

If the user asks to save the lead, preview the exact fields. Use `apollo_contacts_create` only after asking:

```text
This will create or update [N] Apollo contact records. Matching contacts may have the submitted fields overwritten, and that cannot be undone. Do you want me to make that contact write now?
```

Do not treat enrichment, reveal, or sequencing intent as contact-write approval. Submit only the confirmed fields, summarize the returned result after the write, and do not assume whether Apollo created or updated the record.
