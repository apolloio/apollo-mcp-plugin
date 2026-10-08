---
name: sequence-load
description: "Find leads matching criteria and bulk-add them to an Apollo outreach sequence. Handles enrichment, contact creation, deduplication, and enrollment in one flow."
user-invocable: true
argument-hint: [targeting criteria + sequence name]
---

# Sequence Load

Find, enrich, and load contacts into an outreach sequence — end to end. The user provides targeting criteria and a sequence name via "$ARGUMENTS".

This skill owns enrollment of reviewed contacts into a sequence. ICP-to-leads discovery belongs to `/apollo:prospect`, turning the app the user is building into a first outbound motion belongs to `/apollo:cold-email-launch`, and broad GTM planning belongs to `/apollo:gtm-strategist`. When one of those skills delegates here, its safety requirements come with it: follow the stricter of the two and never relax a gate because the caller already stated the goal.

## Examples

- `/apollo:sequence-load add 20 VP Sales at SaaS companies to my "Q1 Outbound" sequence`
- `/apollo:sequence-load SDR managers at fintech startups → Cold Outreach v2`
- `/apollo:sequence-load list sequences` (shows all available sequences)
- `/apollo:sequence-load directors of engineering, 500+ employees, US → Demo Follow-up`
- `/apollo:sequence-load reload 15 more leads into "Enterprise Pipeline"`

## Step 1 — Parse Input

From "$ARGUMENTS", extract:

**Targeting criteria:**
- Job titles → `person_titles`
- Seniority levels → `person_seniorities`
- Industry keywords → `q_organization_keyword_tags`
- Company size → `organization_num_employees_ranges`
- Locations → `person_locations` or `organization_locations`

**Sequence info:**
- Sequence name (text after "to", "into", or "→")
- Volume — how many contacts to add (default: 10 if not specified)

If the user just says "list sequences", skip to Step 2 and show all available sequences.

## Step 2 — Find the Sequence

Use `mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_search` to find the target sequence:
- Set `q_name` to the sequence name from input

If no match or multiple matches:
- Show all available sequences in a table: | Name | ID | Status |
- Ask the user to pick one

## Step 3 — Get Email Account

Use `mcp__claude_ai_Apollo_MCP__apollo_email_accounts_index` to list linked email accounts.

- If one account → use automatically
- If multiple → show them and ask which to send from

## Step 4 — Find Matching People

Use `mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search` with the targeting criteria.
- Set `per_page` to the requested volume (or 10 by default)

Present the candidates in a preview table:

| # | Name | Title | Company | Location |
|---|---|---|---|---|

**Confirmation gate: credit spend.** Confirm only the enrichment spend here: **"Enrich these [N] people? This will consume [N] Apollo credits."**

Wait for explicit confirmation. This approval covers enrichment only. It does not authorize revealing personal contact data, creating Apollo contacts, or enrolling anyone — those are separate gates in Steps 5 and 6.

## Step 5 — Enrich and Create Contacts

**Confirmation gate: private-data reveal.** Ask separately before revealing personal emails and phone numbers. Set `reveal_personal_emails` to `true` only once that is granted; if it is declined, enrich without it and continue with work data only.

**Confirmation gate: contact write.** Creating Apollo contacts changes the user's workspace. Show exactly which enriched people will be written and confirm that before any create call. The enrichment approval from Step 4 does not cover it.

For each approved lead:

1. **Enrich** — Use `mcp__claude_ai_Apollo_MCP__apollo_people_bulk_match` (batch up to 10 per call) with:
   - `first_name`, `last_name`, `domain` for each person
   - `reveal_personal_emails` set to `true` only when the reveal gate was approved

2. **Create contacts** — For each enriched person, use `mcp__claude_ai_Apollo_MCP__apollo_contacts_create` with:
   - `first_name`, `last_name`, `email`, `title`, `organization_name`
   - `direct_phone` or `mobile_phone` if available
   - `run_dedupe` set to `true`

Collect all created contact IDs.

## Step 6 — Add to Sequence

**Confirmation gate: enrollment.** Confirm the exact sequence, the exact contacts, and the sender mailbox before enrolling. Contact-write approval does not imply enrollment approval.

**Confirmation gate: sending.** Check the sequence status first. If the sequence is active, enrolling starts live outreach — say that plainly and take a separate explicit confirmation to send, or enroll the contacts paused where the client supports it. Never infer send or activation approval from a request like "load these into the sequence."

Use `mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_add_contact_ids` with:
- `id`: the sequence ID
- `emailer_campaign_id`: same sequence ID
- `contact_ids`: array of created contact IDs
- `send_email_from_email_account_id`: the chosen email account ID
- `sequence_active_in_other_campaigns`: `false` (safe default)

## Step 7 — Confirm Enrollment

Show a summary:

---

**Sequence loaded successfully**

| Field | Value |
|---|---|
| Sequence | [Name] |
| Contacts added | [count] |
| Sending from | [email address] |
| Credits used | [count] |

**Contacts enrolled:**

| Name | Title | Company | Email |
|---|---|---|---|

---

## Step 8 — Offer Next Actions

Offering an action is not approval to take it. Picking one from this list starts that action's own gates again; nothing approved earlier in this run carries into it.

Ask the user:

1. **Load more** — Find and add another batch of leads, re-running the credit, reveal, contact-write, and enrollment gates for that batch
2. **Review sequence** — Show sequence details and all enrolled contacts
3. **Remove a contact** — Use `mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_remove_or_stop_contact_ids` to remove specific contacts
4. **Pause a contact** — Re-add with `status: "paused"` and an `auto_unpause_at` date

## Safety rules

- Never fabricate results or report actions that did not run.
- Never spend Apollo credits, reveal private contact data, write contacts, enroll contacts, activate, or send without the separate explicit approval for that specific step; one approval never covers the next.
- Read-only sequence lookup, email-account lookup, and candidate search need no approval; do not manufacture gates for them.
- Prefer capability discovery and current Apollo client metadata over hard-coded assumptions; if a needed capability is missing, state the blocker and continue only with planning-level guidance.
