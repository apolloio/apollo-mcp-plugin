---
name: prospect
description: "Full ICP-to-leads pipeline. Describe your ideal customer in plain English and get a ranked table of enriched decision-maker leads with emails and phone numbers."
user-invocable: true
argument-hint: [describe your ideal customer]
---

# Prospect

Go from an ICP description to a ranked, enriched lead list in one shot. The user describes their ideal customer via "$ARGUMENTS".

This skill owns ICP-to-leads discovery. When the user is starting from an app they are building rather than from an ICP, hand off to `/apollo:cold-email-launch`; when they want reviewed contacts enrolled in a sequence, hand off to `/apollo:sequence-load`; broad GTM planning belongs to `/apollo:gtm-strategist`. Hand off only when that skill is available in the current environment, and do not rebuild its workflow here. When one of those skills delegates to this one, its safety requirements still apply: follow the stricter of the two and never relax a gate because the caller already stated the goal.

## Examples

- `/apollo:prospect VP of Engineering at Series B+ SaaS companies in the US, 200-1000 employees`
- `/apollo:prospect heads of marketing at e-commerce companies in Europe`
- `/apollo:prospect CTOs at fintech startups, 50-500 employees, New York`
- `/apollo:prospect procurement managers at manufacturing companies with 1000+ employees`
- `/apollo:prospect SDR leaders at companies using Salesforce and Outreach`

## Step 1 — Parse the ICP

Extract structured filters from the natural language description in "$ARGUMENTS":

**Company filters:**
- Industry/vertical keywords → `q_organization_keyword_tags`
- Employee count ranges → `organization_num_employees_ranges`
- Company locations → `organization_locations`
- Specific domains → `q_organization_domains_list`

**Person filters:**
- Job titles → `person_titles`
- Seniority levels → `person_seniorities`
- Person locations → `person_locations`

If the ICP is vague, ask 1-2 clarifying questions before proceeding. At minimum, you need a title/role and an industry or company size.

## Step 2 — Search for Companies

Use `mcp__claude_ai_Apollo_MCP__apollo_mixed_companies_search` with the company filters:
- `q_organization_keyword_tags` for industry/vertical
- `organization_num_employees_ranges` for size
- `organization_locations` for geography
- Set `per_page` to 25

## Step 3 — Enrich Top Companies

Use `mcp__claude_ai_Apollo_MCP__apollo_organizations_bulk_enrich` with the domains from the top 10 results. This reveals revenue, funding, headcount, and firmographic data to help rank companies.

If the client reports a credit cost for this call, surface it and get explicit approval before running it. Free, shallow company discovery needs no gate.

## Step 4 — Find Decision Makers

Use `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search` with:
- `person_titles` and `person_seniorities` from the ICP
- `q_organization_domains_list` scoped to the enriched company domains
- `per_page` set to 25

## Step 5 — Enrich Top Leads

**Confirmation gate: credit spend.** State exactly how many credits the enrichment will consume and which leads it covers, then wait for explicit approval. The user's original ICP request is not that approval.

**Confirmation gate: private-data reveal.** Revealing personal emails and phone numbers is a separate decision from spending credits. Ask for it on its own, and set `reveal_personal_emails` to `true` only once it is granted. If it is declined, enrich without it and continue with work data only.

Use `mcp__claude_ai_Apollo_MCP__apollo_people_bulk_match` to enrich up to 10 leads per call with:
- `first_name`, `last_name`, `domain` for each person
- `reveal_personal_emails` set to `true` only when the reveal gate was approved

If more than 10 leads, batch into multiple calls within the approved volume. Enriching beyond that volume needs a new approval.

## Step 6 — Present the Lead Table

Show results in a ranked table:

### Leads matching: [ICP Summary]

| # | Name | Title | Company | Employees | Revenue | Email | Phone | ICP Fit |
|---|---|---|---|---|---|---|---|---|

**ICP Fit** scoring:
- **Strong** — title, seniority, company size, and industry all match
- **Good** — 3 of 4 criteria match
- **Partial** — 2 of 4 criteria match

If the private-data reveal gate was not approved, mask the Email and Phone columns and say so instead of silently dropping them.

**Summary**: Found X leads across Y companies. Z credits consumed.

## Step 7 — Offer Next Actions

Offering an action is not approval to take it. Picking one from this list starts that action's own gate; nothing approved earlier in this run carries into it.

Ask the user:

1. **Save all to Apollo** — Confirmation gate: contact write. Show exactly which leads will be written, then bulk-create contacts via `mcp__claude_ai_Apollo_MCP__apollo_contacts_create` with `run_dedupe: true` for each lead
2. **Load into a sequence** — Confirmation gate: enrollment. Ask which sequence, then delegate to `/apollo:sequence-load` when it is available and let it run its own gates; otherwise run the same gated steps directly. Do not enroll anyone on the strength of this choice alone
3. **Deep-dive a company** — Enrich and summarize any company from the list, delegating to a dedicated company-intel skill when one is available in the current environment and otherwise running the same gated steps here
4. **Refine the search** — Adjust filters and re-run
5. **Export** — Format leads as a CSV-style table for easy copy-paste

## Safety rules

- Never fabricate prospect results or report actions that did not run.
- Never spend Apollo credits, reveal private contact data, write contacts, or enroll contacts without the separate explicit approval for that specific step; one approval never covers the next.
- Read-only search and ranking need no approval; do not manufacture gates for them.
- Prefer capability discovery and current Apollo client metadata over hard-coded assumptions; if a needed capability is missing, state the blocker and continue only with planning-level guidance.
