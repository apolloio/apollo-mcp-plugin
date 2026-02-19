---
description: "Instant lead enrichment. Get full profile with email and phone from a name, company, or LinkedIn URL."
---

# Enrich Lead: Instant Contact Intelligence

Enrich a person's data to get their full profile, email, and phone number. The user provides identifying info via "$ARGUMENTS" (name + company, LinkedIn URL, or email).

## Step 1: Parse Input

From "$ARGUMENTS", extract whatever identifiers are available:
- First name + last name
- Company name or domain
- LinkedIn URL
- Email address

## Step 2: Enrich the Person

Use `mcp__apollo__apollo_people_match` with all available identifiers:
- `first_name`, `last_name` if name provided
- `domain` or `organization_name` if company provided
- `linkedin_url` if LinkedIn provided
- `email` if email provided
- Set `reveal_personal_emails` to `true`

Warn the user this consumes 1 Apollo credit before calling.

## Step 3: Enrich Their Company

If the person is found, also use `mcp__apollo__apollo_organizations_enrich` on their company domain to add company context.

## Step 4: Present the Profile

Format as a contact card:

### Contact Profile
- **Name**: Full name
- **Title**: Current role
- **Company**: Name (employee count, industry)
- **Location**: City, State, Country
- **Email**: Work email (and personal if revealed)
- **Phone**: Direct / mobile / corporate
- **LinkedIn**: Profile URL
- **Company Revenue**: Range
- **Company Funding**: Total raised

### Quick Actions
Ask if they want to:
1. Save as a contact in Apollo
2. Add to an outreach sequence
3. Find similar people at the same company
4. Find similar people at other companies
