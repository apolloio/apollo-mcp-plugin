---
name: enrich-lead
description: "Instant lead enrichment. Drop a name, company, LinkedIn URL, or email and get the full contact card with email, phone, title, company intel, and next actions."
license: MIT
metadata:
  author: Apollo.io
  version: "0.3.0"
---

# Enrich Lead

Turn any identifier in the user's request into a full contact dossier.

## Examples

- `Enrich Tim Zheng at Apollo.`
- `Enrich https://www.linkedin.com/in/timzheng.`
- `Find the contact details for sarah@stripe.com.`
- `Enrich Jane Smith, VP Engineering at Notion.`
- `Enrich the CEO of Figma.`

## Step 1 â€” Parse Input

From the user's request, extract every identifier available:
- First name, last name
- Company name or domain
- LinkedIn URL
- Email address
- Job title (use as a matching hint)

If the input is ambiguous (e.g. just "CEO of Figma"), first use the Apollo MCP tool `apollo_mixed_people_api_search` with relevant title and domain filters to identify the person, then proceed to enrichment.

## Step 2 â€” Enrich the Person

Before calling person enrichment, say exactly:

> "Enriching [name] will consume 1 credit (no charge if not found). Do you want to proceed?"

Wait for explicit confirmation. Do not call the tool if the user has not confirmed.

Use the Apollo MCP tool `apollo_people_match` with all available identifiers:
- `first_name`, `last_name` if name is known
- `domain` or `organization_name` if company is known
- `linkedin_url` if LinkedIn is provided
- `email` if email is provided
- Set `reveal_personal_emails` to `true`

If the match fails, try `apollo_mixed_people_api_search` with looser filters and present the top 3 candidates. Ask the user to pick one, then re-enrich.

## Step 3 â€” Enrich Their Company

Company enrichment is a separate credit-consuming action. Before calling it, say exactly:

> "Enriching [domain] will consume 1 credit (no charge if not found). Do you want to proceed?"

Wait for explicit confirmation. If the user declines, present the person data without enriched company context.

Use the Apollo MCP tool `apollo_organizations_enrich` with the person's company domain to pull firmographic context.

## Step 4 â€” Present the Contact Card

Format the output exactly like this:

---

**[Full Name]** | [Title]
[Company Name] Â· [Industry] Â· [Employee Count] employees

| Field | Detail |
|---|---|
| Email (work) | ... |
| Email (personal) | ... (if revealed) |
| Phone (direct) | ... |
| Phone (mobile) | ... |
| Phone (corporate) | ... |
| Location | City, State, Country |
| LinkedIn | URL |
| Company Domain | ... |
| Company Revenue | Range |
| Company Funding | Total raised |
| Company HQ | Location |

---

## Step 5 â€” Offer Next Actions

Ask the user which action to take:

1. **Save to Apollo** â€” Create this person as a contact via `apollo_contacts_create` with `run_dedupe: true`
2. **Add to a sequence** â€” Ask which sequence, then run the sequence-load flow
3. **Find colleagues** â€” Search for more people at the same company using `apollo_mixed_people_api_search` with `q_organization_domains_list` set to this company
4. **Find similar people** â€” Search for people with the same title/seniority at other companies
