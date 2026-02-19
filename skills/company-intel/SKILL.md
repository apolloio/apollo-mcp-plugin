---
name: company-intel
description: "Full company intelligence report. Get firmographics, org chart, hiring signals, and a strategic brief with recommended entry points for any company."
user-invocable: true
argument-hint: [company name or domain]
---

# Company Intel

Build a complete intelligence brief on any company — firmographics, key people, hiring signals, and a strategic playbook for how to break in. The user provides a company via "$ARGUMENTS".

## Examples

- `/apollo:company-intel Stripe`
- `/apollo:company-intel notion.so`
- `/apollo:company-intel that Databricks competitor in the lakehouse space`
- `/apollo:company-intel apollo.io — focus on their engineering team`
- `/apollo:company-intel Figma — who should I sell developer tools to here?`

## Step 1 — Identify the Company

From "$ARGUMENTS", determine the input type:

**Domain provided** (e.g. `stripe.com`):
→ Use directly in Step 2

**Company name provided** (e.g. `Stripe`):
→ Use `mcp__claude_ai_Apollo_MCP__apollo_mixed_companies_search` with the name as keyword
→ If multiple results, show top 3 and ask user to confirm

**Description provided** (e.g. `that Databricks competitor`):
→ Use `mcp__claude_ai_Apollo_MCP__apollo_mixed_companies_search` with `q_organization_keyword_tags` matching the description
→ Present top 3 results, ask user to confirm

Also extract any **focus area** from "$ARGUMENTS" (e.g. "engineering team", "who to sell to") to tailor the report in later steps.

## Step 2 — Enrich the Company

Use `mcp__claude_ai_Apollo_MCP__apollo_organizations_enrich` with the company `domain`.

Capture:
- Full company name, domain, description
- Industry, sub-industry, keywords
- Employee count and range
- Estimated revenue range
- Total funding raised, latest funding round and date
- HQ location, founded year
- Phone number, LinkedIn URL
- Technology tags / keywords

## Step 3 — Map the Org Chart

Run three parallel searches using `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search`, all with `q_organization_domains_list` set to the company domain:

**Search A — C-Suite & Founders**
- `person_seniorities`: `["c_suite", "founder", "owner"]`
- `per_page`: 10

**Search B — VPs & Directors**
- `person_seniorities`: `["vp", "director"]`
- `per_page`: 15

**Search C — Department Focus** (if user specified a focus area like "engineering")
- `person_titles`: titles matching the focus area (e.g. `["CTO", "VP Engineering", "Head of Engineering", "Engineering Manager"]`)
- `per_page`: 10

If no focus area was specified, default Search C to:
- `person_seniorities`: `["manager", "senior"]`
- `per_page`: 10

## Step 4 — Pull Hiring Signals

Use `mcp__claude_ai_Apollo_MCP__apollo_organizations_job_postings` with the organization `id` from the enrichment result.
- Set `per_page` to 100

Analyze the postings to identify:
- Which departments are growing fastest (count roles by department)
- Seniority of hires (first hire vs. team expansion)
- Technologies and tools mentioned in job descriptions
- Budget signals (senior/leadership hires = investment in that area)

## Step 5 — Present the Intelligence Brief

Format as a structured report:

---

## [Company Name] — Intelligence Brief

### Overview

| Field | Detail |
|---|---|
| Domain | ... |
| Industry | ... |
| Founded | ... |
| HQ | ... |
| Employees | ... |
| Revenue (est.) | ... |
| Funding | ... (latest round + total) |
| Description | ... |

### Org Chart — Key People

**Leadership**

| Name | Title | Seniority |
|---|---|---|

**Department: [Focus Area or "Operations"]**

| Name | Title | Seniority |
|---|---|---|

### Hiring Signals

| Department | Open Roles | Signal |
|---|---|---|

Top technologies mentioned in postings: [list]

### Strategic Playbook

Based on the company data, provide:

1. **Best entry point** — Which person to contact first and why (title, seniority, likely ownership of budget)
2. **Multi-thread targets** — 2-3 additional people to engage for a multi-threaded approach
3. **Timing read** — Are they growing, stable, or contracting? Recent funding? Hiring surge?
4. **Angle** — What pain points does their hiring/growth suggest? What would resonate?
5. **Landmines** — Any signals to be cautious about (layoffs, pivots, etc.)

---

## Step 6 — Offer Next Actions

Ask the user:

1. **Enrich a contact** — Pick any person from the org chart and run `/apollo:enrich-lead` to get their email and phone
2. **Bulk enrich the team** — Enrich up to 10 key people at once using `mcp__claude_ai_Apollo_MCP__apollo_people_bulk_match`
3. **Save as an account** — Create the company as an account in Apollo using `mcp__claude_ai_Apollo_MCP__apollo_accounts_create`
4. **Load into a sequence** — Pick contacts and run `/apollo:sequence-load`
5. **Find similar companies** — Use the company's attributes to search for lookalikes via `mcp__claude_ai_Apollo_MCP__apollo_mixed_companies_search` with matching industry, size, and location filters
6. **Explore a department** — Re-run the org chart search focused on a specific department
