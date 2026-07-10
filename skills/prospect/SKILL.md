---
name: prospect
description: "Find prospects from an ICP using Apollo search first, with credit-spending steps and record saves only after explicit approval."
user-invocable: true
argument-hint: [describe your ideal customer]
---

# Prospect

Turn an ICP description into a ranked prospect shortlist. Default to search-only results. Do not charge credits, show private contact data, save records, or sequence anyone unless the user explicitly approves that separate step.

Operate like a GTM engineer helping a seller build a usable prospecting motion. Make one concise, correctable assumption when the user's ICP is underspecified and a safe read-only search can still proceed. Do not expose raw tool names, endpoint details, internal IDs, or private contact fields in seller-facing output unless a confirmed next action requires them.

## Examples

In Replit, ask for the same workflow in natural language. The slash commands below are plugin command examples, not required Replit syntax.

- `/apollo:prospect VP of Engineering at Series B+ SaaS companies in the US, 200-1000 employees`
- `/apollo:prospect heads of marketing at e-commerce companies in Europe`
- `/apollo:prospect CTOs at fintech startups, 50-500 employees, New York`
- `/apollo:prospect procurement managers at manufacturing companies with 1000+ employees`
- `/apollo:prospect SDR leaders at companies using Salesforce and Outreach`

Replit builder prompts:

- `I am building a Replit lead finder. Given form inputs for title, industry, headcount, and geography, design the Apollo search flow and result table.`
- `Find VP Engineering prospects at Series B fintech companies in the US, but start search-only with 10 results.`
- `My app has an ICP form for steel manufacturing companies. Help me turn the inputs into an Apollo search without saving anything.`

## Step 0 - Confirm Available Tools

Use the Apollo tools exposed by the current client. Tool names vary by client, so discover or confirm tools before relying on exact names.

Needed capabilities:

- people search, such as `apollo_mixed_people_api_search`
- optional company search, such as `apollo_mixed_companies_search`
- optional people enrichment/match, such as `apollo_people_match` or `apollo_people_bulk_match`
- optional contact creation, such as `apollo_contacts_create`

If a needed capability is missing, explain what is unavailable and continue only with safe alternatives.

## Step 1 - Parse the ICP

Extract structured filters from "$ARGUMENTS":

Company filters:

- industry or vertical keywords, usually `q_organization_keyword_tags` when supported
- employee count ranges, usually `organization_num_employees_ranges`
- company locations, usually `organization_locations`
- company domains, usually `q_organization_domains_list`
- technologies or funding signals, if supported by the exposed tools

Person filters:

- job titles, usually `person_titles`
- seniority levels, usually `person_seniorities`
- person locations, usually `person_locations`

If the ICP includes a role/title plus one company, geography, domain, industry, size, or funding signal, proceed with one concise, correctable assumption instead of turning the interaction into a questionnaire. If neither a role/title nor a company/account signal is present, ask one clarifying question before searching.

## Step 2 - Search Read-Only

Run people search first with a small, appropriate limit. Use the user's requested volume when reasonable; otherwise default to 10.

Use company search only if it is available and safe in the current environment. Treat Apollo company search as credit-consuming, non-mutating search when the current tool description or source-derived risk matrix indicates one-credit search behavior; do not treat approval for company search as approval to mutate accounts or contacts. If company search is credit-gated or unclear, ask before using it:

```text
This company search may consume 1 credit. Do you want to proceed?
```

Do not call credit-charging enrichment tools during this step.

## Step 3 - Present a Search-Only Shortlist

Show a concise table without private emails, phones, or unnecessary internal IDs:

| # | Name or masked name | Title | Company | Location | Fit |
|---|---|---|---|---|---|

Fit scoring:

- Strong: title, seniority, company type, and location/size match
- Good: most major criteria match
- Partial: useful but missing one or more key criteria

Summarize:

- number of prospects reviewed
- filters used
- whether results are search-only or include any credit-charged details
- UI-friendly fields for a Replit lead finder, such as display name, title, company, location, fit reason, and next-safe-action
- recommended safe next step, such as refine filters, add more detail for selected prospects, save selected contacts, or prepare for sequencing

## Step 4 - Offer Gated Next Actions

Offer only actions that are available in the current client:

1. Refine the search with different filters.
2. Add more detail for selected prospects after credit confirmation.
3. Save selected prospects to Apollo after mutation confirmation.
4. Load selected contacts into a sequence by switching to the sequencing workflow.
5. Format the search-only shortlist as a copyable table if the user wants to work from it manually.

Before bulk people enrichment, say this exact confirmation with the real count:

```text
This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?
```

For one-person enrichment, say this exact confirmation with the person's name or label:

```text
Enriching [name] will consume 1 credit (no charge if not found). Do you want to proceed?
```

For company enrichment, use the exact company enrichment confirmation required by the available tool.

Before phone number or direct-dial reveal, say:

```text
Revealing phone or direct-dial data may consume credits for [N] people. Do you want to proceed?
```

If the user asks for both bulk enrichment and phone/direct-dial data, ask the bulk enrichment confirmation and the phone/direct-dial confirmation as two separate exact confirmations. Do not merge the phone/direct-dial confirmation into an addendum or paraphrase.

Before contact creation, say:

```text
This will create or update [N] Apollo contact record(s). Please confirm before I continue.
```

Before account creation or account update, say:

```text
This will create or update [N] Apollo account record(s). Please confirm before I continue.
```

Before field-specific account edits, say:

```text
This will update Apollo [object type] field(s): [specific fields and values]. Please confirm before I continue.
```

Approval to charge credits for more detail does not imply approval for contact creation or sequencing.
