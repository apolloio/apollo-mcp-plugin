---
name: enrich-lead
description: "Instant lead enrichment. Drop a name, company, LinkedIn URL, or email and get the full contact card with email, phone, title, company intel, and next actions."
user-invocable: true
argument-hint: [name, company, LinkedIn URL, or email]
---

# Enrich Lead

Turn any identifier into a full contact dossier. The user provides identifying info via "$ARGUMENTS".

This skill owns single-lead enrichment from a known identifier. Discovering leads from an ICP description belongs to `/apollo:prospect`, enrolling reviewed contacts in a sequence belongs to `/apollo:sequence-load`, turning the app the user is building into a first outbound motion belongs to `/apollo:cold-email-launch`, and broad GTM planning belongs to `/apollo:gtm-strategist`. Hand off only when that skill is available in the current environment, and do not rebuild its workflow here. When one of those skills delegates to this one, its safety requirements still apply: follow the stricter of the two and never relax a gate because the caller already stated the goal.

## Examples

- `/apollo:enrich-lead Tim Zheng at Apollo`
- `/apollo:enrich-lead https://www.linkedin.com/in/timzheng`
- `/apollo:enrich-lead sarah@stripe.com`
- `/apollo:enrich-lead Jane Smith, VP Engineering, Notion`
- `/apollo:enrich-lead CEO of Figma`

## Step 1 — Parse Input

From "$ARGUMENTS", extract every identifier available:
- First name, last name
- Company name or domain
- LinkedIn URL
- Email address
- Job title (use as a matching hint)

If the input is ambiguous (e.g. just "CEO of Figma"), first use `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search` with relevant title and domain filters to identify the person, then proceed to enrichment.

## Step 2 — Enrich the Person

**Confirmation gate: credit spend.** State that this enrichment consumes 1 Apollo credit and who it covers, then wait for explicit approval. The user's original request to enrich is not that approval.

**Confirmation gate: private-data reveal.** Revealing personal emails and phone numbers is a separate decision from spending credits. Ask for it on its own, and set `reveal_personal_emails` to `true` only once it is granted. If it is declined, enrich without it and continue with work data only.

Use `mcp__claude_ai_Apollo_MCP__apollo_people_match` with all available identifiers:
- `first_name`, `last_name` if name is known
- `domain` or `organization_name` if company is known
- `linkedin_url` if LinkedIn is provided
- `email` if email is provided
- Set `reveal_personal_emails` to `true` only when the reveal gate was approved

If the match fails, try `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search` with looser filters and present the top 3 candidates. Ask the user to pick one, then re-enrich. Re-enriching after a failed match spends another credit, so confirm that spend before the retry.

## Step 3 — Enrich Their Company

Use `mcp__claude_ai_Apollo_MCP__apollo_organizations_enrich` with the person's company domain to pull firmographic context.

If the client reports a credit cost for this call, surface it and get explicit approval before running it. Free, shallow company discovery needs no gate.

## Step 4 — Present the Contact Card

Format the output exactly like this:

---

**[Full Name]** | [Title]
[Company Name] · [Industry] · [Employee Count] employees

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

If the private-data reveal gate was not approved, mask the personal email and phone rows and say so instead of silently dropping them.

---

## Step 5 — Offer Next Actions

Offering an action is not approval to take it. Picking one from this list starts that action's own gate; nothing approved earlier in this run carries into it.

Ask the user which action to take:

1. **Save to Apollo** — Confirmation gate: contact write. Show exactly what will be written, then create this person as a contact via `mcp__claude_ai_Apollo_MCP__apollo_contacts_create` with `run_dedupe: true`
2. **Add to a sequence** — Confirmation gate: enrollment. Ask which sequence, then delegate to `/apollo:sequence-load` when it is available and let it run its own gates; otherwise run the same gated steps directly. Do not enroll anyone on the strength of this choice alone
3. **Find colleagues** — Search for more people at the same company using `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search` with `q_organization_domains_list` set to this company
4. **Find similar people** — Search for people with the same title/seniority at other companies

## Safety rules

- Never fabricate enrichment results or report actions that did not run.
- Never spend Apollo credits, reveal private contact data, write contacts, or enroll contacts without the separate explicit approval for that specific step; one approval never covers the next.
- Read-only search and candidate disambiguation need no approval; do not manufacture gates for them.
- Prefer capability discovery and current Apollo client metadata over hard-coded assumptions; if a needed capability is missing, state the blocker and continue only with planning-level guidance.
