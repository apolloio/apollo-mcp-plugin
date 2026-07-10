---
name: inbound-website-visitors
description: "Set up Apollo website visitor tracking for a site, with safe tracker inspection, install-script retrieval, and gated updates."
user-invocable: true
argument-hint: [website or Replit app to configure]
---

# Inbound Website Visitors

Help set up Apollo website visitor tracking, especially for a Replit-hosted website. Treat this as a tracker setup and install workflow, not a visitor analytics workflow, unless separate visitor analytics tools are discovered.

This skill does not retrieve identified website visitors. If the user asks who visited, explain that the current setup tools configure tracking and direct them to the Apollo Website Visitors UI or a separate visitor analytics tool if one is discovered.

## Examples

In Replit, ask for the same workflow in natural language. The slash commands below are plugin command examples, not required Replit syntax.

- `/apollo:inbound-website-visitors set up tracking on this Replit app`
- `/apollo:inbound-website-visitors get the Apollo install script`
- `/apollo:inbound-website-visitors add example.com as an allowed tracking domain`
- `/apollo:inbound-website-visitors email the install script to my developer`

Replit builder prompts:

- `My tracking script is installed on a Replit app, but no visitors appear. Walk through deployment, domain, traffic timing, and script placement.`
- `Help me add Apollo website visitor tracking to my Replit landing page, but do not change Apollo settings yet.`
- `I am building a setup checklist for visitor tracking. Show what my app should verify before asking to update Apollo settings.`

## Step 0 - Confirm Available Tools

Use the Apollo tools exposed by the current client. Tool names vary by client and these tools may be feature-flagged.

Expected capabilities:

- tracker state lookup, such as `apollo_website_visitor_domain_tracker_index`
- official install script retrieval, such as `apollo_website_visitor_domain_tracker_install_script`, if available in the current client
- tracker update, such as `apollo_website_visitor_domain_tracker_update`
- install email, such as `apollo_website_visitor_domain_tracker_send_install_email`

If these tools are not available, explain that website visitor MCP support appears unavailable in this environment and may require deployment, OAuth scope, product feature, user permission, or the `mcp_integration` / `mcp_developers` feature gates.

The separate install-script capability is conditional. It is not present in the checked-out local Leadgenie default-branch inventory, so prefer it when discovered but do not assume Replit can see it.

## Step 1 - Inspect Tracker State

The tracker lookup tool is not guaranteed to be read-only. In current Leadgenie source, `apollo_website_visitor_domain_tracker_index` is a find-or-create operation: if no tracker exists, it may create an empty team-scoped tracker.

Before calling tracker lookup in a real Apollo account, say:

```text
This may create an empty Apollo website visitor tracker if one does not already exist. Please confirm before I inspect tracker state.
```

Call the tracker lookup tool only after that confirmation, or during an approved promptbook/test context where setup mutation is expected.

Record only the information needed for setup:

- whether a tracker exists,
- tracker ID if needed for a confirmed action,
- configured domains,
- domain limit,
- tracking status,
- whether credits are exhausted,
- whether contact-level tracking is enabled,
- intent paths if available.

Do not expose unnecessary raw payloads.

## Step 2 - Fetch the Official Install Script

If the install-script tool is available, use it to fetch:

- app ID,
- canonical script,
- placement rules.

Prefer the official install-script tool. Do not hand-assemble the tracking snippet when the official tool exists.

If the install-script tool is not available, stop short of fabricating a tracking script. Explain that canonical script retrieval is unavailable in the current client, record the missing capability, and offer useful next steps: ask the user to paste the script from the Apollo Website Visitors UI, open Apollo to retrieve the official script themselves, or continue only with non-script placement guidance or a separately confirmed install-email flow if that outreach tool is visible.

If no tracker exists or the tool returns a clear blocker, explain what is needed before installation can continue.

## Step 3 - Help Install in Replit

For a Replit app, inspect the local project files if available and identify where the script should go.

Common placements:

- HTML app: before `</head>` or as instructed by placement rules.
- React/Vite/Next-style app: the main HTML shell or framework-specific head/script location.

Only edit local project files when the user asks for implementation in that project. Do not change Apollo tracker settings during local code edits unless separately approved.

For a Replit setup helper, present a checklist the app can show: deployed URL, custom domain if any, script placement, publish status, recent test traffic, configured tracker domains, and whether the next step is local code placement or an Apollo settings change.

## Step 4 - Mutation Gate for Tracker Updates

Before adding, editing, or deleting tracked domains or intent paths, say:

```text
This will update Apollo website visitor tracker settings. I will [specific change]. Please confirm before I continue.
```

Rules:

- Strip protocol and path from domains before proposing an add.
- Check domain limits when that data is available.
- For intent paths, require paths to start with `/`, use human-readable labels, and keep the level tied to business intent such as pricing, demo, contact, or high-value product pages.
- Warn the user if they are at or near the configured domain limit before adding a domain.
- Use exact existing referrer IDs from tracker lookup for edit/delete.
- Never guess referrer IDs.

## Step 5 - Outreach Gate for Install Email

Before sending an install email, first confirm the recipient and subject as non-send details. Then ask the exact outreach confirmation:

```text
This can affect real outreach or send a real email. I will send a real email with the Apollo install script to [recipient] with subject [subject]. Please confirm before I continue.
```

Do not send install email during smoke tests or without explicit confirmation.

## Step 6 - Summarize Status

Summarize:

| Field | Value |
|---|---|
| Tracker available | ... |
| Install script available | ... |
| Configured domains | ... |
| Local install target | ... |
| Apollo settings changed | ... |
| Email sent | ... |
| Remaining blocker | ... |

If the requested workflow cannot proceed because tools are missing, say whether the likely blocker is feature flag, permissions, deployment, OAuth scope, or client discovery.
