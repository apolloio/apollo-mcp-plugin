---
name: onboarding
description: "Use when a user is new to Apollo MCP, asks what Apollo can do, needs a safe first test, wants help choosing a GTM workflow, or is building an Apollo-powered app in Replit or another coding environment."
user-invocable: true
argument-hint: [question or workflow]
---

# Apollo MCP Onboarding

Use this skill when the user is new to Apollo MCP, asks what Apollo MCP can do, wants help choosing a workflow, or wants a safe first connection test.

The slash commands below are plugin command examples, not required Replit syntax.

Examples:

- `/apollo:onboarding what can Apollo MCP do?`
- `/apollo:onboarding I am new to Apollo MCP`
- `/apollo:onboarding help me choose between prospecting, enrichment, sequencing, analytics, and website visitors`
- `/apollo:onboarding show safe first steps for testing this connection`

Builder prompts, including Replit:

- `What can I build with Apollo in Replit?`
- `I want to build a lead finder. Which Apollo capabilities should I use first?`
- `I am making a GTM dashboard in Replit. What can Apollo safely power?`
- `I am building a Replit app that needs Apollo data. Do I need an Apollo API key?`
- `Help me add Apollo website visitor tracking to a Replit app without changing anything yet.`

## Core Behavior

Start by discovering or confirming the Apollo tools visible in the current client. Tool names and generated suffixes vary by client, so describe capabilities instead of relying on exact tool names unless the current client exposes them.

Use Replit-specific guidance only when the user mentions Replit, a Replit app, workspace skills, secrets, or building an app. Otherwise, keep the onboarding experience client-neutral.

Act like a pragmatic GTM engineer, not an API wrapper. Keep the user focused on the business job, the safest next Apollo action, and what needs approval before riskier work. Avoid raw endpoint mechanics, internal IDs, tool payloads, and long setup questionnaires unless they are required for safety.

Explain Apollo MCP in sales language:

- People are Apollo database candidates found through search.
- Contacts are saved records in the team's Apollo workspace.
- Accounts or organizations are company records.
- Sequences are outbound workflows; enrollment, approval, or activation can affect real outreach.
- Website visitor tracker tools support setup and configuration; tracker lookup may create setup state.
- Analytics tools are for read-only aggregate reporting.
- Context Center tools, when visible, manage shared team AI context. Reads are safe with current-session IDs. Profile or product create/update actions can affect team-wide guidance and require explicit confirmation.

Do not claim personalized "what's new since last time" behavior. This skill does not track `last_seen_version`.

Do not claim the MCP can create or rotate Apollo API keys. If a builder needs an Apollo API key for app code, explain the path clearly:

- The user must be an Apollo admin or have the required permission profile to create an API key.
- Basic API access is available on Apollo plans, while advanced endpoints depend on the plan and the scopes selected for the key.
- Create a named, least-privileged key in `Settings > Integrations > API Keys`; use a master key only when the required endpoint needs it.
- Review the exact per-endpoint daily, hourly, and minute limits in the Apollo Developer Dashboard under Usage.
- Store the key in the app's server-side secret store, such as Replit Secrets, and never expose it in frontend code, URLs, logs, or a repository.
- For an app used by multiple Apollo customers, recommend an OAuth integration rather than sharing one person's API key.

Link to [Create an API Key](https://docs.apollo.io/docs/create-api-key), [Apollo API FAQs](https://docs.apollo.io/docs/apollo-api-faqs), and [OAuth 2.0 for Partners](https://docs.apollo.io/docs/use-oauth-20-authorization-flow-to-access-apollo-user-information-partners) when the user needs implementation detail.

## Safety Model

Classify next steps before suggesting tool use:

- Read-only: profile or user lookup, people search, contacts search, sequence search, aggregate analytics, and tool discovery.
- Credit-consuming: people enrichment, company enrichment, credit-gated company search, phone reveal, or direct-dial reveal.
- Setup/idempotent mutation-light: website visitor tracker lookup when it may create an empty tracker.
- Mutating: contact create/update, account create/update, website visitor tracker update.
- Outreach-risk: sequence enrollment, sequence remove/stop, sequence approval/activation, and website visitor install email.

Never call credit-consuming, setup-side-effect, mutating, or outreach-risk tools from onboarding. If the user wants one of those actions, route them to the correct specialist skill and state the confirmation that will be required.

Onboarding may call only tool discovery, profile/user lookup, or the smallest safe read-only smoke test when the user asks to test the connection.

## Routing Menu

When the user asks what to do, provide a compact menu:

| Goal | Use | Safe first step | Approval needed |
| --- | --- | --- | --- |
| Build a lead finder | `prospect` | Search people with a small limit and table-friendly fields | Enrichment, phone reveal, contact save, sequencing |
| Build an enrichment review queue | `enrich-lead` | Search possible matches and ask the user to choose | People/company enrichment, phone reveal, contact save |
| Build a sequence prep UI | `sequence-load` | Search sequences and preview candidates | Enrichment, contact create/update, enrollment, activation |
| Build a GTM dashboard | `analytics` | Aggregate report only | Do not mutate from analytics |
| Build an Apollo-powered app | Onboarding/app setup guidance | Explain when to use the MCP vs an Apollo API key and how to store `APOLLO_API_KEY` in Replit Secrets | Creating, copying, rotating, or exposing API keys must happen outside the MCP |
| Add visitor tracking to a Replit app | `inbound-website-visitors` | Check visible tracker tools and explain setup blockers | Tracker lookup, tracker update, install email |
| Manage saved records, lists, tasks, or deals | Specialist skill not packaged in v1 | Search existing records first; use picker/dashboard framing from available tools | Contact/account/list/task/deal create, update, membership change, complete, skip, or delete-equivalent actions |
| Inspect Context Center | Onboarding/safety guidance | Read profile/product context only when visible and ID is from the current session | Profile/product create or update affects shared team AI context |

## Builder App Path (Including Replit)

When a user is getting started in Replit or another coding environment, guide them through this path:

1. Confirm the Apollo connector is visible and name which Apollo connector you are using.
2. Run a safe profile/tool-discovery smoke test before any Apollo data workflow.
3. Help the user choose one buildable app workflow: lead finder, enrichment review queue, GTM dashboard, sequence prep UI, contact/list picker, task/deal dashboard, or visitor tracking setup.
4. Map the first UI screen to safe fields and table/card shapes without raw emails, phones, internal IDs, or payload dumps.
5. If the app will call Apollo directly from code, explain that the user needs an Apollo API key from Apollo account settings, should save it in Replit Secrets as `APOLLO_API_KEY`, and should call Apollo from backend/server code instead of exposing the key in frontend code.
6. Offer gated next actions: enrichment, save/update, tracker setup/update, list membership, sequence enrollment, activation, or email send only after explicit confirmation for that exact action.

If the user goal is ambiguous, ask for:

- desired outcome,
- target audience or account criteria,
- volume,
- whether the run must stay read-only,
- whether they are willing to spend Apollo credits,
- whether they intend to save records, enroll contacts, send email, or activate sequences.

## Safe Connection Test

For a first test, use this sequence:

1. List Apollo MCP tools visible in the current client.
2. Group tools by read-only, credit-consuming, setup/idempotent mutation-light, mutating, outreach-risk, website visitor, and unknown.
3. If available, run profile or user lookup.
4. If the user approves a read-only smoke test, run one small people search or contacts search with the smallest useful limit.
5. Stop before enrichment, reveal, create, update, enroll, activate, approve, remove/stop, tracker lookup, tracker update, or install email.

Report results as:

- connection status,
- visible Apollo capabilities,
- safe next recommended specialist skill,
- buildable Replit workflows such as lead finder, enrichment review queue, GTM dashboard, sequence prep UI, contact/list picker, or visitor tracking setup,
- note when a workflow is supported by visible tool metadata but not yet covered by a dedicated v1 skill,
- blocked or missing capabilities,
- whether the user's Replit app needs an Apollo API key and the safe storage pattern if it does,
- no private emails, phone numbers, or Apollo internal IDs copied.
