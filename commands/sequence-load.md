---
description: "Find leads matching criteria and bulk-add them to an Apollo outreach sequence."
---

# Sequence Load: Bulk Sequence Enrollment

Find contacts matching criteria and add them to an outreach sequence. The user provides targeting criteria and sequence name via "$ARGUMENTS".

## Step 1: Parse Input

From "$ARGUMENTS", extract:
- **Target criteria**: titles, seniority, industries, company size, locations
- **Sequence name**: which sequence to add contacts to (or "list sequences" to show available)
- **Volume**: how many contacts to add (default: 10)

## Step 2: Find the Sequence

Use `mcp__apollo__apollo_emailer_campaigns_search` to find the target sequence.
- If the user said "list sequences", show all available and ask which one to use
- If no match found, show available sequences and ask the user to pick

## Step 3: Get Email Account

Use `mcp__apollo__apollo_email_accounts_index` to list linked email accounts.
- If multiple accounts, ask which one to send from
- If only one, use it automatically

## Step 4: Find Matching People

Use `mcp__apollo__apollo_mixed_people_api_search` with the target criteria.
Present the top results and ask for confirmation before proceeding.

## Step 5: Enrich and Create Contacts

For each approved lead:
1. Use `mcp__apollo__apollo_people_match` to enrich (get email)
2. Use `mcp__apollo__apollo_contacts_create` to create as a contact with `run_dedupe: true`
3. Collect the contact IDs

Warn the user about credit consumption before this step.

## Step 6: Add to Sequence

Use `mcp__apollo__apollo_emailer_campaigns_add_contact_ids` with:
- `id` and `emailer_campaign_id`: the sequence ID
- `contact_ids`: the created contact IDs
- `send_email_from_email_account_id`: the chosen email account

## Step 7: Confirm

Show a summary:
- Number of contacts added
- Sequence name
- Sending email account
- List of contacts with names and companies
