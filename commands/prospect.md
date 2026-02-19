---
description: "Full ICP-to-leads prospecting pipeline. Describe your ideal customer and get enriched decision-maker leads."
---

# Prospect: ICP-to-Leads Pipeline

The user wants to find leads matching their Ideal Customer Profile (ICP). Execute this multi-step pipeline using "$ARGUMENTS" as the ICP description.

## Step 1: Parse the ICP

Extract structured filters from the natural language description:
- **Company filters**: industry keywords, employee ranges, locations, specific domains
- **Person filters**: job titles, seniority levels, person locations
- If the ICP is vague, ask 1-2 clarifying questions before proceeding

## Step 2: Search for Companies

Use `mcp__apollo__apollo_mixed_companies_search` with:
- `q_organization_keyword_tags` for industry/vertical
- `organization_num_employees_ranges` for company size
- `organization_locations` for geography
- Request 25 results per page

## Step 3: Enrich Top Companies

Use `mcp__apollo__apollo_organizations_bulk_enrich` with domains from the top 10 companies.
This reveals revenue, funding, employee counts, and firmographic data. Use this to rank companies.

## Step 4: Find Decision Makers

Use `mcp__apollo__apollo_mixed_people_api_search` with:
- `person_titles` and `person_seniorities` from the ICP
- `q_organization_domains_list` scoped to enriched companies
- Request 10-25 results

## Step 5: Enrich Top Leads

Use `mcp__apollo__apollo_people_match` on the best leads to reveal email and phone.
Warn the user that enrichment consumes Apollo credits before proceeding.

## Step 6: Present Results

Show a formatted table:
| Name | Title | Company | Size | Revenue | Email | ICP Match Reason |

Then ask if they want to:
1. Save as contacts in Apollo
2. Add to an outreach sequence
3. Refine the search
