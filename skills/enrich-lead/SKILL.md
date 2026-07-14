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

Before setting `reveal_personal_emails: true` or displaying private email fields, preview the selected count and ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

Do not reveal those fields without an explicit answer to this separate question. The match still requires the exact 1-credit confirmation immediately before the call. A prior enrichment approval is not reveal approval.

Request phone reveal only when the visible `apollo_people_match` schema supports it. Follow that tool's exact confirmation and asynchronous polling instructions, including the documented request-ID field and polling tool. Do not assume a top-level or nested ID, and do not invent a polling tool. If the complete reveal-and-poll contract is unavailable, report that phone reveal is unsupported. Do not claim that a phone number was returned until the documented polling flow succeeds.

## 4. Present the Result

Show only returned and approved fields: name, title, company, location, profile URL, company domain, company size, company context, and approved contact details. Mark uncertain matches and omit unavailable values. Do not expose internal identifiers unless a separately confirmed next action needs them.

## 5. Confirm Contact Writes

If the user asks to save the lead, preview the exact fields. Use `apollo_contacts_create` only after asking:

```text
This will write [N] Apollo contact records with duplicate prevention enabled. Do you want me to make that contact write now?
```

Do not treat enrichment, reveal, or sequencing intent as contact-write approval. Set `run_dedupe: true`, summarize the result after a confirmed write, and report the returned create, skip, duplicate, or error outcome without assuming an update occurred.
