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

Use `apollo_people_match` only after showing the selected identity. For a match without phone reveal, replace the placeholder and ask exactly:

```text
Enriching [name] will use 1 credit (no charge if not found). Do you want to proceed?
```

Do not enrich until the user explicitly agrees to that credit step. Credit approval does not approve private-data reveal or a contact write.

For optional company context from `apollo_organizations_enrich`, replace the placeholder and ask its separate exact question:

```text
Enriching [domain] will consume 1 credit (no charge if not found). Do you want to proceed?
```

## 3. Confirm Private-Data Reveal

Before setting `reveal_personal_emails: true` or displaying private email fields, preview the selected count and ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

Do not reveal those fields without an explicit answer to this separate question. The match still requires the exact 1-credit confirmation immediately before the call. A prior enrichment approval is not reveal approval.

Phone reveal follows the tool's combined confirmation rule. Do not ask for enrichment and phone reveal in two separate turns. When `reveal_phone_number: true`, replace the placeholder and ask exactly:

```text
Enriching [name] will use 1 credit, plus additional credits if the phone number is successfully revealed (no charge if the number isn't found). Do you want to proceed?
```

Phone enrichment is asynchronous. After the confirmed `apollo_people_match` call, take only its top-level `request_id`, wait about 10 seconds, and call `apollo_webhook_result_show`. If a not-ready response includes `retry_after_seconds` without a terminal error code, wait that interval and retry, up to about five attempts. Do not claim that a phone number was returned until polling succeeds; if retries are exhausted, report that the reveal is still processing.

## 4. Present the Result

Show only returned and approved fields: name, title, company, location, profile URL, company domain, company size, company context, and approved contact details. Mark uncertain matches and omit unavailable values. Do not expose internal identifiers unless a separately confirmed next action needs them.

## 5. Confirm Contact Writes

If the user asks to save the lead, preview the exact fields and explain that deduplication will be enabled. Use `apollo_contacts_create` only after asking exactly:

```text
This will create or update [N] Apollo contact records with deduplication enabled. Do you want me to make that contact write now?
```

Do not treat enrichment, reveal, or sequencing intent as contact-write approval. Set `run_dedupe: true`, summarize the result after a confirmed write, and report any dedupe outcome, skipped field, or server error.
