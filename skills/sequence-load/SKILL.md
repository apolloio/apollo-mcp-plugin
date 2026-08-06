---
name: sequence-load
description: "Prepare and load Apollo contacts into a sequence with staged approvals. Use when finding sequence candidates, selecting a sending account, enriching or saving contacts, enrolling contacts, activating a sequence, or sending outreach."
---

# Sequence Load

Prepare sequence membership in stages. Search and preview first, then obtain distinct approvals for credits, private-data reveal, contact writes, enrollment, activation, and direct sending. Approval at one stage never carries into another.

## 1. Resolve the Plan Read-Only

Extract the targeting criteria, sequence name, and volume; default to 10 contacts. Use `apollo_emailer_campaigns_search` to resolve the sequence, `apollo_email_accounts_index` to list sending accounts, and `apollo_mixed_people_api_search` to preview candidates.

If a name has zero or multiple sequence matches, ask the user to select one. If multiple sending accounts exist, ask the user to select one. Show candidates without private emails or phones. Stop if a required capability is missing or if the visible schema rejects the request.

Select at most 10 people for enrichment and enrollment in one run. If the user requests more, do not loop `apollo_people_bulk_match` across conversational batches. Explain that larger jobs require Apollo's persistent collection workflow and keep this skill to a reviewed 10-person batch.

## 2. Confirm Credit Use

Use `apollo_users_api_profile` with `include_credit_usage: true` and `include_waterfall_capability: true` to obtain the current balance and the team-level email and phone waterfall flags in one call. Reuse those capability flags for the rest of the conversation. Before `apollo_people_bulk_match`, preview selected candidates and replace the placeholder in this exact question:

```text
Found [N] contacts. Enriching all will use up to [N] credits. You have [X] credits remaining. Do you want to proceed?
```

Do not enrich until confirmed. If balance data is unavailable, stop and ask the user to reconnect Apollo. Credit approval does not approve reveal, saving, enrollment, activation, or sending.

## 3. Confirm Private-Data Reveal

Private contact data is not required merely to preview fit. For a standard personal-email reveal, ask exactly:

```text
This will reveal private contact data for [N] selected people. Do you want me to reveal it now?
```

Use the capability flags before choosing a reveal path. When waterfall is enabled for the requested field, use the matching waterfall option by default and the exact search-then-enrich variable-cost confirmation from `apollo_people_bulk_match`, including the returned balance; never quote a fixed waterfall cost. When it is not enabled, use the standard reveal path. If the user explicitly requested waterfall, use the tool's required disabled-capability message and use a standard reveal only if the user accepts.

Before any phone reveal or waterfall request, verify that `apollo_webhook_result_show` is available. If it is unavailable, do not start the request or spend credits; ask the user to reconnect Apollo.

For a standard personal-email reveal, do not reveal those fields until separately confirmed, then repeat the exact bulk-enrichment credit confirmation immediately before the call. A standard phone reveal instead requires one combined confirmation; do not ask for enrichment and phone reveal in two separate turns. When `reveal_phone_number: true`, ask exactly:

```text
Found [N] contacts. Enriching all will use up to [N] credits, plus additional credits for each phone number successfully revealed (no charge if a number isn't found). You have [X] credits remaining. Do you want to proceed?
```

For any accepted asynchronous phone or waterfall request, poll `apollo_webhook_result_show` with the exact top-level request ID and the timing rules in the current tool description. Do not claim a phone number or waterfall result until polling succeeds.

## 4. Confirm Contact Writes

Preview the contacts and fields that `apollo_contacts_bulk_create` would create or update. Explain that Apollo automatically updates matching contacts, overwriting submitted fields irreversibly. Ask:

```text
This will create or update [N] Apollo contact records. Matching contacts may have the submitted fields overwritten, and that cannot be undone. Do you want me to make that contact write now?
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

Use `apollo_emailer_campaigns_remove_or_stop_contact_ids` only for `remove` or `stop`. `remove` permanently removes the contact from the sequence; `stop` halts future steps while preserving stop context. Do not map a pause or finish request to this tool; report it as unsupported unless another visible tool explicitly provides that mode.

Resolve unknown contact IDs with `apollo_contacts_search` and unknown sequence IDs with `apollo_emailer_campaigns_search` in the current session. For `stop`, ask the user for the `stop_reason`; never invent it. Preview the exact contacts, sequences, count, mode, and stop reason when applicable, then ask for separate confirmation that the live membership or sending state will change. Enrollment approval does not authorize later membership changes.

## 8. Summarize

Report the resolved sequence, sending account, candidates searched, contacts enriched, details revealed, contacts created or updated, contacts enrolled, credits used or expected, activation or send state, skipped stages, and errors. Never report an action as complete unless its tool call succeeded.
