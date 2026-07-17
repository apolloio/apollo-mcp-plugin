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

Use `apollo_mixed_people_api_search` for people. Use `apollo_organizations_lookup` only to resolve a fuzzy company name or domain into lightweight organization candidates and an Apollo organization ID. Organization lookup is free discovery and does not require credit confirmation.

Do not treat organization lookup as filtered company prospecting: it does not replace industry, employee-count, funding, technology, or website-visitor company search. For filtered company prospecting, use `apollo_mixed_companies_search` only after explaining that a result-returning request costs exactly 1 credit and asking exactly:

```text
This will consume 1 credit. Do you want to proceed?
```

If the paid tool is unavailable or the user declines, state that limitation instead of silently broadening the request.

People search and organization lookup are read-only. When organization lookup returns multiple candidates, show the candidate name, domain, and website, then ask the user to choose before using an organization ID in a later action. Show people-search results with name or masked name, title, company, location, fit level, and fit reason. Do not include private emails, phones, or unnecessary internal identifiers.

Rank as Strong, Good, or Partial based on title, seniority, account fit, geography, and other requested signals. State filters, assumptions, result count, and that the shortlist is search-only.

## 3. Confirm Selected Enrichment

Use `apollo_users_api_profile` to obtain the current credit balance when available. Before `apollo_people_bulk_match`, preview the selected count, maximum charge, and returned balance. Replace the placeholder and ask exactly:

```text
This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?
```

Do not enrich unselected rows. If the balance is unavailable, say so rather than estimating it. Credit approval does not approve private-data reveal, contact writes, or sequencing.

## 4. Confirm Private-Data Reveal

Before requesting reveal options or displaying private contact fields, preview the selected count and ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

For personal-email reveal, keep this approval separate and then repeat the exact bulk-enrichment credit confirmation immediately before the call. Phone reveal instead requires one combined confirmation; do not ask for enrichment and phone reveal in two separate turns. When `reveal_phone_number: true`, ask exactly:

```text
This will enrich [N] people and use up to [N] credits (1 credit per match, no charge for unmatched), plus additional credits for each phone number successfully revealed (no charge if a number isn't found). Do you want to proceed?
```

Request phone reveal only when the visible `apollo_people_bulk_match` schema supports it. Follow that tool's exact confirmation and asynchronous polling instructions, including the documented request-ID field and polling tool. Do not assume a top-level or nested ID, and do not invent a polling tool. If the complete reveal-and-poll contract is unavailable, report that phone reveal is unsupported. Do not claim that phone numbers were returned until the documented polling flow succeeds.

## 5. Confirm Contact Writes

If the user asks to save selected prospects through `apollo_contacts_bulk_create`, preview the exact count and fields, warn that the bulk tool may create a new record for every submitted item, and ask:

```text
This will create [N] Apollo contact records. Duplicate handling depends on the active Apollo tool contract. Do you want me to make that contact write now?
```

Do not infer write approval from enrichment or reveal approval. Submit the confirmed contacts as one bulk request only after reviewing the input for duplicates. After any confirmed action, return the updated shortlist with per-row status, actual or expected credits, and errors. Route sequence requests to `sequence-load`; do not enroll contacts from this workflow.
