---
name: prospect
description: "Find and rank Apollo prospects from an ideal customer profile with search-first results and staged approvals. Use when building a lead list, finding decision makers, refining an ICP, enriching selected people, or saving prospects."
---

# Prospect

Turn an ideal customer profile into a ranked search-only shortlist. Spend credits, reveal private contact data, and write contacts only for user-selected rows after separate approvals.

## 1. Parse the ICP

Extract role or title, seniority, industry, employee range, company or person geography, domains, technologies, funding signals, and requested volume. Default to 10 results when no count is given.

If a role plus at least one account signal is present, make one concise, correctable assumption and proceed. If neither a role nor an account signal is present, ask one clarifying question.

## 2. Search and Rank

Use `apollo_mixed_people_api_search` for people. Use `apollo_organizations_lookup` by default for free, shallow organization discovery from a fuzzy name, domain, or supported discovery filters such as employee range, location, revenue, technology, or funding. It returns lightweight candidates and Apollo organization IDs and does not require credit confirmation.

Use `apollo_mixed_companies_search` only when the user explicitly needs full organization details in the search results. Explain that a result-returning request costs exactly 1 credit and ask exactly:

```text
This will consume 1 credit. Do you want to proceed?
```

If the paid tool is unavailable or the user declines, state that limitation instead of silently broadening the request.
If `apollo_organizations_lookup` is unavailable, report that limitation; do not substitute paid company search unless the user separately requests full organization details and approves its one-credit cost.

People search and organization lookup are read-only. When organization lookup returns multiple candidates, show the candidate name, domain, and website, then ask the user to choose before using an organization ID in a later action. Show people-search results with name or masked name, title, company, location, fit level, and fit reason. Do not include private emails, phones, or unnecessary internal identifiers.

Rank as Strong, Good, or Partial based on title, seniority, account fit, geography, and other requested signals. State filters, assumptions, result count, and that the shortlist is search-only.

Select at most 10 people for enrichment in one run. If the user requests more, do not loop `apollo_people_bulk_match` across conversational batches. Explain that larger jobs require Apollo's persistent collection workflow and keep this skill to a reviewed 10-person batch.

## 3. Confirm Selected Enrichment

Use `apollo_users_api_profile` with `include_credit_usage: true` and `include_waterfall_capability: true` to obtain the current balance and the team-level email and phone waterfall flags in one call. Reuse those capability flags for the rest of the conversation. Before `apollo_people_bulk_match`, preview the selected count, maximum standard-match charge, and returned balance. Replace the placeholder and ask exactly:

```text
Found [N] contacts. Enriching all will use up to [N] credits. You have [X] credits remaining. Do you want to proceed?
```

Do not enrich unselected rows. If the balance is unavailable, stop and ask the user to reconnect Apollo rather than estimating it. Credit approval does not approve private-data reveal, contact writes, or sequencing.

## 4. Confirm Private-Data Reveal

Use the capability flags before offering any email or phone reveal:

- When waterfall is enabled for the requested field, use the matching waterfall option by default and the exact search-then-enrich variable-cost confirmation from `apollo_people_bulk_match`, including the returned balance. Never quote a fixed waterfall cost.
- When waterfall is not enabled, use the standard reveal path. If the user explicitly requested waterfall, use the tool's required disabled-capability message and run a standard reveal only if the user accepts that alternative.
- Before any phone reveal or waterfall request, verify that `apollo_webhook_result_show` is available. If it is unavailable, do not start the request or spend credits; ask the user to reconnect Apollo.

For a standard personal-email reveal, preview the selected count and ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

Keep that personal-email approval separate and then repeat the exact bulk-enrichment credit confirmation immediately before the call. A standard phone reveal instead requires one combined confirmation; do not ask for enrichment and phone reveal in two separate turns. When `reveal_phone_number: true`, ask exactly:

```text
Found [N] contacts. Enriching all will use up to [N] credits, plus additional credits for each phone number successfully revealed (no charge if a number isn't found). You have [X] credits remaining. Do you want to proceed?
```

For any accepted asynchronous phone or waterfall request, poll `apollo_webhook_result_show` with the exact top-level request ID and the timing rules in the current tool description. Do not claim a phone number or waterfall result until polling succeeds.

## 5. Confirm Contact Writes

If the user asks to save selected prospects through `apollo_contacts_bulk_create`, preview the exact count and fields and explain that Apollo automatically updates matching contacts, overwriting submitted fields irreversibly. Ask:

```text
This will create or update [N] Apollo contact records. Matching contacts may have the submitted fields overwritten, and that cannot be undone. Do you want me to make that contact write now?
```

Do not infer write approval from enrichment or reveal approval. Submit the confirmed contacts as one bulk request only after reviewing the input for duplicates. After any confirmed action, return the updated shortlist with per-row status, actual or expected credits, and errors. Route sequence requests to `sequence-load`; do not enroll contacts from this workflow.
