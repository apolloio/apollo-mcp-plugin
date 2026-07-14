---
name: sequence-load
description: "Prepare and load Apollo contacts into a sequence with staged approvals. Use when finding sequence candidates, selecting a sending account, enriching or saving contacts, enrolling contacts, activating a sequence, or sending outreach."
---

# Sequence Load

Prepare sequence membership in stages. Search and preview first, then obtain distinct approvals for credits, private-data reveal, contact writes, enrollment, activation, and direct sending. Approval at one stage never carries into another.

## 1. Resolve the Plan Read-Only

Extract the targeting criteria, sequence name, and volume; default to 10 contacts. Use `apollo_emailer_campaigns_search` to resolve the sequence, `apollo_email_accounts_index` to list sending accounts, and `apollo_mixed_people_api_search` to preview candidates.

If a name has zero or multiple sequence matches, ask the user to select one. If multiple sending accounts exist, ask the user to select one. Show candidates without private emails or phones. Stop if a required capability is missing or if the visible schema rejects the request.

## 2. Confirm Credit Use

Use `apollo_users_api_profile` to show the current credit balance when available. Before `apollo_people_bulk_match`, preview selected candidates and replace the placeholder in this exact question:

```text
This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?
```

Do not enrich until confirmed. If balance data is unavailable, say so. Credit approval does not approve reveal, saving, enrollment, activation, or sending.

## 3. Confirm Private-Data Reveal

Private contact data is not required merely to preview fit. Before requesting reveal options or displaying private fields, ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

For personal-email reveal, do not reveal those fields until separately confirmed, then repeat the exact bulk-enrichment credit confirmation immediately before the call. Phone reveal instead requires one combined confirmation; do not ask for enrichment and phone reveal in two separate turns. When `reveal_phone_number: true`, ask exactly:

```text
This will enrich [N] people and use up to [N] credits (1 credit per match, no charge for unmatched), plus additional credits for each phone number successfully revealed (no charge if a number isn't found). Do you want to proceed?
```

Request phone reveal only when the visible `apollo_people_bulk_match` schema supports it. Follow that tool's exact confirmation and asynchronous polling instructions, including the documented request-ID field and polling tool. Do not assume a top-level or nested ID, and do not invent a polling tool. If the complete reveal-and-poll contract is unavailable, report that phone reveal is unsupported. Do not claim that phone numbers were returned until the documented polling flow succeeds.

## 4. Confirm Contact Writes

Preview the contacts and fields that `apollo_contacts_bulk_create` would create, warn that the bulk tool may create a new record for every submitted item, and ask:

```text
This will create [N] Apollo contact records. Duplicate handling depends on the active Apollo tool contract. Do you want me to make that contact write now?
```

Do not create contacts until this write is confirmed. Review the input for duplicates before submitting one bulk request, then report the returned outcomes before enrollment.

## 5. Confirm Sequence Enrollment

After contacts exist, preview the sequence, contact count, selected sending account, and whether the sequence is active or may send automatically. Default the enrollment status and tool input to `paused`. Before `apollo_emailer_campaigns_add_contact_ids`, replace every placeholder and ask exactly:

```text
This will enroll [N] contacts in [Sequence Name] using [Sending Account] with status paused. Do you want me to enroll them now?
```

Do not enroll until confirmed. Enrollment approval does not approve sequence activation or direct sending. Do not use an active status until the separate activation confirmation below.

## 6. Confirm Activation and Sending Separately

If the user asks to approve or activate a sequence, preview its current state and configured sending behavior. Ask exactly:

```text
This will activate [Sequence Name] and may begin configured outbound sending. Do you want me to activate it now?
```

If the user asks for an immediate direct send, show the recipient, subject, body, and sending account. Ask a new question exactly:

```text
This will send a real message to [Recipient] from [Sending Account]. Do you want me to send it now?
```

Use only a visible capability that supports the requested action. Never infer an activation or send tool, recipient, or sending account.

## 7. Other Membership Changes

For a remove, stop, pause, or finish request through `apollo_emailer_campaigns_remove_or_stop_contact_ids`, preview the exact sequence, contact identifiers, count, and mode. Ask for separate confirmation that the live membership or sending state will change. Enrollment approval does not authorize later membership changes.

## 8. Summarize

Report the resolved sequence, sending account, candidates searched, contacts enriched, details revealed, contacts created or updated, contacts enrolled, credits used or expected, activation or send state, skipped stages, and errors. Never report an action as complete unless its tool call succeeded.
