---
name: onboarding
description: "Connect and verify Apollo MCP with OAuth, explain safety boundaries, and route to a public workflow. Use when getting started, checking an Apollo connection, troubleshooting access, or choosing an Apollo skill."
---

# Apollo Onboarding

Establish a verified Apollo MCP connection, explain only the safeguards relevant to the user's goal, and route to one of the four task skills. Onboarding is read-only and must not spend credits, reveal private contact data, or write records.

## 1. Discover

Check whether an Apollo MCP server and the `apollo_users_api_profile` tool are available. If they are missing, direct the user to the current client's MCP connection settings. Provide these connection facts without inventing client-specific commands:

- Server name: `apollo`
- Endpoint: `https://mcp.apollo.io/mcp`
- Authentication: OAuth 2.0

Never request, collect, display, or store credentials. Do not claim the connection works merely because settings were entered.

## 2. Verify

After the client reports a connection, call `apollo_users_api_profile` with credit usage included when the visible schema supports it. Report only:

- whether authentication succeeded,
- the authenticated team or account label when returned and useful,
- available credit balance when returned,
- any permission or plan limitation returned by Apollo.

If verification fails, give the concise error and ask the user to reconnect in their client settings before another attempt.

## 3. Route

Choose the narrowest workflow that matches the goal:

| Goal | Skill |
|---|---|
| Analyze sales activity or performance | `analytics` |
| Enrich one person or company | `enrich-lead` |
| Build a ranked lead list from an ICP | `prospect` |
| Prepare contacts for a sequence | `sequence-load` |

Explain the next workflow's first safety boundary, ask for only the minimum missing input, and then follow that skill. Do not perform its credit-consuming or write steps during onboarding.
