---
name: sequence-load
description: "Find leads matching criteria and bulk-add them to an Apollo outreach sequence. Handles enrichment, contact creation, deduplication, and enrollment in one flow."
license: MIT
metadata:
  author: Apollo.io
  version: "0.3.0"
---

# Sequence Load

Find, enrich, and load contacts into an outreach sequence end to end. Read the targeting criteria and sequence name from the user's request.

## Examples

- `Add 20 VPs of Sales at SaaS companies to my "Q1 Outbound" sequence.`
- `Load SDR managers at fintech startups into Cold Outreach v2.`
- `List my available sequences.`
- `Add US directors of engineering at companies with 500+ employees to Demo Follow-up.`
- `Load 15 more leads into "Enterprise Pipeline".`

## Step 1 â€” Parse Input

From the user's request, extract:

**Targeting criteria:**
- Job titles â†’ `person_titles`
- Seniority levels â†’ `person_seniorities`
- Industry keywords â†’ `q_organization_keyword_tags`
- Company size â†’ `organization_num_employees_ranges`
- Locations â†’ `person_locations` or `organization_locations`

**Sequence info:**
- Sequence name (text after "to", "into", or "â†’")
- Volume â€” how many contacts to add (default: 10 if not specified)

If the user just says "list sequences", skip to Step 2 and show all available sequences.

## Step 2 â€” Find the Sequence

Use the Apollo MCP tool `apollo_emailer_campaigns_search` to find the target sequence:
- Set `q_name` to the sequence name from input

If no match or multiple matches:
- Show all available sequences in a table: | Name | ID | Status |
- Ask the user to pick one

## Step 3 â€” Get Email Account

Use the Apollo MCP tool `apollo_email_accounts_index` to list linked email accounts.

- If one account â†’ use automatically
- If multiple â†’ show them and ask which to send from

## Step 4 â€” Find Matching People

Use the Apollo MCP tool `apollo_mixed_people_api_search` with the targeting criteria.
- Set `per_page` to the requested volume (or 10 by default)

Present the candidates in a preview table:

| # | Name | Title | Company | Location |
|---|---|---|---|---|

Call `apollo_users_api_profile` with `include_credit_usage: true`, then say exactly:

> "Found [N] contacts. Enriching all will use up to [N] credits. You have [X] credits remaining. Want to proceed, or narrow the scope?"

Wait for explicit confirmation of the full count before proceeding. Do not confirm incrementally by batch.

## Step 5 â€” Enrich and Create Contacts

For each approved lead:

1. **Enrich** â€” Use `apollo_people_bulk_match` (batch up to 10 per call) with:
   - `first_name`, `last_name`, `domain` for each person
   - `reveal_personal_emails` set to `true`

2. **Create contacts** â€” For each enriched person, use `apollo_contacts_create` with:
   - `first_name`, `last_name`, `email`, `title`, `organization_name`
   - `direct_phone` or `mobile_phone` if available
   - `run_dedupe` set to `true`

Collect all created contact IDs.

## Step 6 â€” Add to Sequence

Present a confirmation summary containing the sender email address, sequence name, number of contacts, and enrollment status. Default the status to `paused` so installation does not immediately start outreach. Wait for explicit confirmation before calling the enrollment tool.

Use the Apollo MCP tool `apollo_emailer_campaigns_add_contact_ids` with:
- `id`: the sequence ID
- `emailer_campaign_id`: same sequence ID
- `contact_ids`: array of created contact IDs
- `send_email_from_email_account_id`: the chosen email account ID
- `sequence_active_in_other_campaigns`: `false` (safe default)
- `status`: `paused` unless the user explicitly confirms active enrollment

## Step 7 â€” Confirm Enrollment

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

## Step 8 â€” Offer Next Actions

Ask the user:

1. **Load more** â€” Find and add another batch of leads
2. **Review sequence** â€” Show sequence details and all enrolled contacts
3. **Remove a contact** â€” Use `apollo_emailer_campaigns_remove_or_stop_contact_ids` to remove specific contacts
4. **Pause a contact** â€” Re-add with `status: "paused"` and an `auto_unpause_at` date
