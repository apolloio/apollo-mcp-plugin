---
name: sequence-load
description: "Prepare contacts for an Apollo sequence with separate approvals for enrichment, contact creation, enrollment, and activation."
user-invocable: true
argument-hint: [targeting criteria + sequence name]
---

# Sequence Load

Help prepare contacts for an Apollo sequence. This workflow must be staged. Do not enrich, create contacts, enroll contacts, approve sequences, activate sequences, or send outreach without explicit approval for that exact step.

Operate like a careful outbound operator, not a raw API wrapper. Keep sequence building, contact enrollment, sequence activation, and direct message sending separate. If a tool is not visible in the current client, do not imply that action is available.

## Examples

In Replit, ask for the same workflow in natural language. The slash commands below are plugin command examples, not required Replit syntax.

- `/apollo:sequence-load add 20 VP Sales at SaaS companies to my "Q1 Outbound" sequence`
- `/apollo:sequence-load SDR managers at fintech startups -> Cold Outreach v2`
- `/apollo:sequence-load list sequences`
- `/apollo:sequence-load directors of engineering, 500+ employees, US -> Demo Follow-up`
- `/apollo:sequence-load reload 15 more leads into "Enterprise Pipeline"`

Replit builder prompts:

- `I want to enroll USA-based steel manufacturing companies into an outbound sequence. Help me build the safe approval flow first.`
- `Create a sequence prep UI for selected leads before saving contacts and enrolling them.`
- `My Replit app has a shortlist of prospects. Show the staged checklist before enrichment, contact save, enrollment, and activation.`

## Step 0 - Confirm Available Tools

Use the Apollo tools exposed by the current client. Tool names vary by client, especially sequence add/remove tools with generated suffixes.

When using sequence search, follow the parameter types exposed by the current client for `page` and `per_page`. Some clients expose numeric paging semantics as string-typed schema fields. Use small values such as page 1 and per_page 1, and if the client or server rejects paging because of a schema mismatch, stop and report a `tool/schema` blocker instead of retrying blindly with larger pages or unsafe fallbacks.

Needed capabilities:

- sequence search, such as `apollo_emailer_campaigns_search`
- email account lookup, such as `apollo_email_accounts_index`
- people search, such as `apollo_mixed_people_api_search`
- optional people enrichment, such as `apollo_people_bulk_match`
- optional contact create/update, such as `apollo_contacts_create`
- optional sequence create/update tools
- optional add contacts to sequence
- optional sequence approval/activation
- optional remove or stop contacts from sequence
- optional direct message draft/send tools

If a required tool is unavailable, stop before the missing step and explain the blocker.

## Step 1 - Parse Input

Extract:

- targeting criteria
- sequence name
- requested volume, defaulting to 10
- whether the user only wants to list sequences

If the request is just to list sequences, run sequence search only and stop.

If the user is building a Replit sequence prep UI, structure the answer as staged screens or checklist steps: candidate review, enrichment approval, contact save approval, sequence selection, sending account selection, enrollment confirmation, and separate activation confirmation.

## Step 2 - Resolve Sequence and Sending Account

Use read-only tools to:

- find the sequence by name,
- list candidate sequences if there are zero or multiple matches,
- list available email accounts if enrollment is eventually requested.

If exactly one sending account is visible, use it as the default in previews. If multiple are visible, ask the user which sending account to use before any enrollment confirmation.

Do not enroll or activate anything in this step.

## Step 3 - Search and Preview Candidates

Use people search with the targeting criteria and requested volume.

Present a preview table without private emails or phones:

| # | Name or masked name | Title | Company | Location | Fit |
|---|---|---|---|---|---|

Then ask whether the user wants to continue to enrichment.

## Step 4 - Credit Gate for Enrichment

Before bulk people enrichment, say this exact confirmation with the real count:

```text
This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?
```

Do not enrich until the user confirms.

## Step 5 - Mutation Gate for Contact Creation

After enrichment, preview the contacts that would be created or updated.

Before contact creation, say:

```text
This will create or update [N] Apollo contact record(s). Please confirm before I continue.
```

Do not create or update contacts until the user confirms.

## Step 6 - Outreach Gate for Sequence Enrollment

After contacts exist, preview:

- sequence name,
- contact count,
- sending account,
- whether the sequence is active or may send automatically.
- UI confirmation copy that separates enrollment from activation.

Before adding contacts to a sequence, say:

```text
This can affect real outreach or send a real email. I will add [N] contact(s) to [Sequence Name] using [sending account]. Please confirm before I continue.
```

If an add-contacts-to-sequence tool is visible in the current client, do not hard-decline enrollment as unavailable. Stop before the tool call and ask the exact confirmation above. If the add tool is not visible, record that as a missing capability and do not attempt a fallback.

When enrollment is approved and the visible tool supports these fields, use the resolved sequence ID for the campaign ID, resolved contact IDs from the current session, the confirmed sending account ID, and a conservative default such as `sequence_active_in_other_campaigns: false`.

Do not enroll until the user confirms.

## Step 7 - Separate Gate for Activation or Approval

If the user asks to approve, activate, or otherwise start sequence sending, ask separately:

```text
This can enable outbound sending. Please confirm that you want to approve or activate [Sequence Name].
```

Approval to enroll contacts does not imply approval to activate or approve a sequence.

If sequence create or update tools are visible and the user asks to build or edit a sequence, confirm the sequence name, audience, goal, and message-review status before any create or update call. Sequence creation or editing does not imply permission to enroll contacts or activate sending.

## Step 8 - Separate Gate for Remove or Stop

If the user asks to remove, pause, stop, or otherwise change existing sequence membership, preview:

- contact count,
- sequence name,
- sequence ID resolved from this session,
- exact contact IDs resolved from this session,
- requested mode such as remove, stop, pause, or finish,
- whether active outreach state may change.

Before removing or stopping contacts in a sequence, say:

```text
This will change live sequence membership or sending state for [N] contact(s) in [Sequence Name] ([Sequence ID]) using mode [mode] for contact IDs [contact IDs]. Please confirm before I continue.
```

Approval to enroll contacts does not imply approval to remove, stop, pause, or finish contacts in a sequence.

## Step 9 - Direct Message Boundary

If direct email/message draft or send tools are visible, keep draft creation separate from sending. Creating a draft is not the same as sending. Before any send-now action, confirm recipient, subject, body, and sending mailbox, and state that it sends a real email. Do not send from an inferred or guessed mailbox ID.

## Step 10 - Summarize Results

After any confirmed action, summarize:

| Field | Value |
|---|---|
| Sequence | ... |
| Contacts searched | ... |
| Contacts enriched | ... |
| Contacts created/updated | ... |
| Contacts enrolled | ... |
| Sending account | ... |
| Credits used or expected | ... |

Report skipped steps clearly.
