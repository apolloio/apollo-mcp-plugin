---
name: prospect
description: "Full ICP-to-leads pipeline. Describe your ideal customer in plain English and get a ranked table of enriched decision-maker leads with emails and phone numbers."
license: MIT
metadata:
  author: Apollo.io
  version: "0.3.0"
---

# Prospect

Go from an ICP description in the user's request to a ranked, enriched lead list.

## Examples

- `Find VPs of Engineering at Series B+ SaaS companies in the US with 200-1000 employees.`
- `Find heads of marketing at e-commerce companies in Europe.`
- `Find CTOs at fintech startups with 50-500 employees in New York.`
- `Find procurement managers at manufacturing companies with 1000+ employees.`
- `Find SDR leaders at companies using Salesforce and Outreach.`

## Step 1 â€” Parse the ICP

Extract structured filters from the user's natural-language ICP description:

**Company filters:**
- Industry/vertical keywords â†’ `q_organization_keyword_tags`
- Employee count ranges â†’ `organization_num_employees_ranges`
- Company locations â†’ `organization_locations`
- Specific domains â†’ `q_organization_domains_list`

**Person filters:**
- Job titles â†’ `person_titles`
- Seniority levels â†’ `person_seniorities`
- Person locations â†’ `person_locations`

If the ICP is vague, ask 1-2 clarifying questions before proceeding. At minimum, you need a title/role and an industry or company size.

## Step 2 â€” Search for Companies

Company search costs 1 credit when it returns results. Before calling the search tool, say exactly:

> "This will consume 1 credit. Do you want to proceed?"

Wait for explicit confirmation.

Use the Apollo MCP tool `apollo_mixed_companies_search` with the company filters:
- `q_organization_keyword_tags` for industry/vertical
- `organization_num_employees_ranges` for size
- `organization_locations` for geography
- Set `per_page` to 25

## Step 3 â€” Enrich Top Companies

Because this is a search-then-enrich workflow, call `apollo_users_api_profile` with `include_credit_usage: true`. Then say exactly:

> "Found [N] companies. Enriching all will use up to [N] credits. You have [X] credits remaining. Want to proceed, or narrow the scope?"

Wait for explicit confirmation of the full company count. Do not confirm or enrich incrementally by batch.

Use the Apollo MCP tool `apollo_organizations_bulk_enrich` with the domains from the top 10 results. This reveals revenue, funding, headcount, and firmographic data to help rank companies.

## Step 4 â€” Find Decision Makers

Use the Apollo MCP tool `apollo_mixed_people_api_search` with:
- `person_titles` and `person_seniorities` from the ICP
- `q_organization_domains_list` scoped to the enriched company domains
- `per_page` set to 25

## Step 5 â€” Enrich Top Leads

Refresh the user's balance with `apollo_users_api_profile` and `include_credit_usage: true`. Then say exactly:

> "Found [N] contacts. Enriching all will use up to [N] credits. You have [X] credits remaining. Want to proceed, or narrow the scope?"

Wait for explicit confirmation of the full contact count. Do not start enriching in batches and confirm incrementally.

Use the Apollo MCP tool `apollo_people_bulk_match` to enrich up to 10 leads per call with:
- `first_name`, `last_name`, `domain` for each person
- `reveal_personal_emails` set to `true`

If more than 10 leads, batch into multiple calls.

## Step 6 â€” Present the Lead Table

Show results in a ranked table:

### Leads matching: [ICP Summary]

| # | Name | Title | Company | Employees | Revenue | Email | Phone | ICP Fit |
|---|---|---|---|---|---|---|---|---|

**ICP Fit** scoring:
- **Strong** â€” title, seniority, company size, and industry all match
- **Good** â€” 3 of 4 criteria match
- **Partial** â€” 2 of 4 criteria match

**Summary**: Found X leads across Y companies. Z credits consumed.

## Step 7 â€” Offer Next Actions

Ask the user:

1. **Save all to Apollo** â€” Bulk-create contacts via `apollo_contacts_create` with `run_dedupe: true` for each lead
2. **Load into a sequence** â€” Ask which sequence and run the sequence-load flow for these contacts
3. **Deep-dive a company** â€” Ask for company intelligence on any company from the list
4. **Refine the search** â€” Adjust filters and re-run
5. **Export** â€” Format leads as a CSV-style table for easy copy-paste
