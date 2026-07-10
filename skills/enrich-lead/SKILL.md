---
name: enrich-lead
description: "Look up and add detail to a lead with Apollo, using search for disambiguation and explicit confirmation before spending credits."
user-invocable: true
argument-hint: [name, company, LinkedIn URL, or email]
---

# Enrich Lead

Turn an identifier into an Apollo contact profile. Search and disambiguation are allowed first. Credit-charging detail, private contact data, and contact creation require explicit approval.

Act like a seller-facing GTM analyst. Resolve ambiguity, explain what is known versus still uncertain, and recommend the next safe action. Do not present raw API payloads, unnecessary internal IDs, or implementation fields in the contact card.

## Examples

In Replit, ask for the same workflow in natural language. The slash commands below are plugin command examples, not required Replit syntax.

- `/apollo:enrich-lead Person Name at Example Company`
- `/apollo:enrich-lead https://www.linkedin.com/in/example`
- `/apollo:enrich-lead sarah@example.com`
- `/apollo:enrich-lead Person Name, VP Engineering, Example Company`
- `/apollo:enrich-lead CEO of Figma`

Replit builder prompts:

- `I have signup emails in my Replit app. Match likely people first, show possible identities, then ask before enrichment.`
- `Build an enrichment review queue for these emails so a seller can approve credit spend one lead at a time.`
- `A product signup came in with only an email. Help me identify who it might be before charging credits.`

## Step 0 - Confirm Available Tools

Use the Apollo tools exposed by the current client. Tool names vary by client, so discover or confirm tools before relying on exact names.

Needed capabilities:

- people search for disambiguation, such as `apollo_mixed_people_api_search`
- people match/enrichment, such as `apollo_people_match`
- optional organization enrichment, such as `apollo_organizations_enrich`
- optional contact create/update, such as `apollo_contacts_create` or `apollo_contacts_update`

If credit-charging detail tools are unavailable, provide search-only candidates and explain what can still be done.

## Step 1 - Parse Input

Extract all identifiers available from "$ARGUMENTS":

- first name and last name
- company name or domain
- LinkedIn URL
- email address
- title or role hint

If the input is ambiguous, use people search to present up to 3 likely candidates. Ask the user which one to enrich.

For a Replit enrichment review queue, present possible matches as UI-ready choices: display label, title, company, location, confidence note, and what enrichment would add after confirmation.

For a batch of signup emails, build an enrichment review queue before spending credits. Group rows as exact-looking match, ambiguous match, and no clear match. Ask the user to approve either individual rows or the full reviewed count before enrichment:

```text
This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?
```

## Step 2 - Ask Before Enrichment

Before calling a one-person match/enrichment tool, say this exact confirmation with the person's name or label:

```text
Enriching [name] will consume 1 credit (no charge if not found). Do you want to proceed?
```

Do not call enrichment until the user confirms.

If the user declines, provide the best search-only summary available and offer to refine the search.

## Step 3 - Enrich the Person

After approval, call the available people match/enrichment tool with the strongest identifiers:

- LinkedIn URL, if available
- email, if available
- first name, last name, and company domain/name
- title as a matching hint, if supported

Before revealing phone number or direct-dial data, ask separately if the available tool says reveal consumes credits:

```text
Revealing phone or direct-dial data may consume credits for [N] people. Do you want to proceed?
```

Reveal personal emails or phone numbers only if the user approved the relevant contact-data enrichment or reveal action and the tool supports it.

## Step 4 - Optional Company Context

If organization enrichment appears credit-consuming, ask before calling it using the exact confirmation required by the available tool. For one company, say:

```text
Enriching [domain] will consume 1 credit (no charge if not found). Do you want to proceed?
```

If not approved or unavailable, use company context already returned by search/person enrichment.

## Step 5 - Present the Contact Card

Keep the output concise and avoid unnecessary raw payloads:

| Field | Detail |
|---|---|
| Name | ... |
| Title | ... |
| Company | ... |
| Location | ... |
| Work email | ... |
| Phone | ... |
| LinkedIn | ... |
| Company domain | ... |
| Company size | ... |
| Company revenue or funding | ... |
| Company HQ | ... |
| Notes | ... |

Omit fields that are unavailable. Do not include internal IDs unless needed for a confirmed next action.

## Step 6 - Offer Gated Next Actions

Offer available next actions:

1. Save to Apollo.
2. Find colleagues at the same company.
3. Find similar people.
4. Add to a sequence through the sequencing workflow.
5. Update contact or account fields after a separate write confirmation.
6. Return a review-queue row shape for the user's Replit app without saving anything.

Before saving to Apollo, say:

```text
This will create or update [N] Apollo contact record(s). Please confirm before I continue.
```

Before field-specific contact or account edits, say:

```text
This will update Apollo [object type] field(s): [specific fields and values]. Please confirm before I continue.
```

Approval to charge credits for more detail does not imply approval for saving or sequencing.
