---
name: onboarding
description: "Connect an AI client to Apollo MCP with OAuth, verify the connection and permissions, explain credit and write safeguards, and route the user to the right Apollo sales workflow. Use when getting started with Apollo, checking an Apollo connection, or deciding which Apollo skill to use."
license: MIT
metadata:
  author: Apollo.io
  version: "0.3.0"
---

# Apollo Onboarding

Help the user establish and verify an Apollo MCP connection, then choose a workflow.

## Connect

1. Check whether the client already exposes Apollo MCP tools.
2. If Apollo tools are unavailable, direct the user to the client's MCP connection settings and use:
   - Server name: `apollo`
   - Endpoint: `https://mcp.apollo.io/mcp`
   - Authentication: OAuth 2.0
3. Ask the user to complete the Apollo sign-in and return after the client reports a connected server.
4. Never request, collect, display, or persist authentication credentials.

Keep directions client-neutral unless the user identifies their client. Do not claim the connection succeeded until a verification call works.

## Verify

Call the read-only Apollo MCP tool `apollo_users_api_profile` with `include_credit_usage: true`.

Report:
- authenticated Apollo user and team, when returned
- available credit balance, when returned
- whether the connection is ready
- any permission or plan limitation returned by Apollo

If verification fails, quote the concise error, ask the user to reconnect through the client's MCP settings, and retry only after they confirm.

## Explain Safety

Before routing work, explain only the safeguards relevant to the selected workflow:

- `analytics` is read-only.
- `enrich-lead` confirms each credit-consuming enrichment separately.
- `prospect` confirms the full enrichment count and current balance before batch enrichment.
- `sequence-load` previews candidates, confirms credit use, and separately confirms enrollment. Enrollment defaults to paused unless the user explicitly requests active enrollment.

Apollo permissions, plan limits, and credits still apply to every tool call.

## Route

Choose one workflow from the user's goal:

| Goal | Skill |
|---|---|
| Analyze sales activity or performance | `analytics` |
| Enrich one person and company | `enrich-lead` |
| Build a ranked lead list from an ICP | `prospect` |
| Add selected contacts to a sequence | `sequence-load` |

Ask for the minimum missing input, then follow that skill's instructions. Do not perform a write or credit-consuming action during onboarding.
