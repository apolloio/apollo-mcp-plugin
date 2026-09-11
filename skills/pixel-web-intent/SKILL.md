---
name: pixel-web-intent
description: "Install the Apollo website visitor pixel and turn anonymous traffic into people you can act on. Identifies visiting contacts when the Apollo client supports it, falls back to named visiting companies, and hands off to outbound."
user-invocable: true
argument-hint: [optional: the domain to track]
---

# Pixel & Web Intent

Take an untracked app to a reviewed visitor list: identified visiting people when the current Apollo client exposes contact-level Website Visitor search — saved contacts first, then net-new people — with named visiting companies and accounts as the company-level fallback. The user can name the domain to track via "$ARGUMENTS"; when that is empty, infer it from the project's deployment configuration.

Treat every Apollo capability as conditional: rely only on capabilities discovered in the current Apollo client, and never invent a tool name, tracker state, script, visitor, person, company, intent level, credit cost, or Apollo ID.

## Examples

- `/apollo:pixel-web-intent`
- `/apollo:pixel-web-intent track acme.com`
- `/apollo:pixel-web-intent who visited my pricing page this week?`
- `/apollo:pixel-web-intent install the pixel and show me the companies that visited`

## Ground rules for what counts as a visit

Present identified people only when they were returned by a discovered contact-level Website Visitor search capability — a saved-contact search or a people search supporting Website Visitor filters; never infer that an individual person visited from company-level traffic, employee rosters, or tracker settings. When only company-level data is available, say so plainly rather than implying person-level discovery succeeded. Website Visitor intent here is a first-party signal from the user's own tracked site: first-party Website Visitors are not Apollo's third-party Buying Intent topic product, and never claim a Buying Intent topic filter was applied through this workflow.

## Inspect the app

Determine the deployed domain to track and the correct browser-side placement before touching Apollo: read the project's framework, entry HTML or shared layout, and deployment configuration. Identify the exact file where a head-level script belongs and whether the site is deployed at a stable domain. State inferences as brief, correctable assumptions.

## Discover capabilities

Discover whether the current Apollo client exposes tracker lookup, official install-script retrieval, tracker settings updates, a saved-contact search that supports contact-level Website Visitor filters, a people search that supports contact-level Website Visitor filters, a person enrichment or match capability that returns per-person `website_visitor` evidence, and a company search that supports website visitor filters (the company-level fallback). Report missing capabilities plainly. Contact-level Website Visitor filters fail closed when the capability, entitlement, or permission is unavailable — treat a failed-closed search as unavailable and continue honestly. The `website_visitor` evidence block is additive: Apollo omits it, rather than erroring, when entitlement or visit history is missing, so treat a missing block as evidence being unavailable and never infer anything about visits from its absence. Fail closed only when the underlying Apollo capability itself is unavailable; a missing companion skill is never a blocker by itself.

## Install and configure the pixel

Prefer delegating installation and configuration to a dedicated website-visitors setup skill when one is available in the current environment; do not require it. When none is present, run the same safe workflow directly through discovered Apollo capabilities and keep every gate below.

1. Confirmation gate: tracker lookup. Explain that lookup may create an empty team tracker when none exists, then obtain explicit user confirmation before calling it. Read only the setup fields needed: tracker existence, configured domains, limits, status, and required IDs.
2. Retrieve only the canonical install script through a discovered official capability, including any placement rules it returns. If that capability is unavailable, ask the user to obtain the official script in Apollo; do not hand-build or modify the snippet.
3. Confirmation gate: local edit. Show the exact project file and proposed script placement, then obtain explicit user confirmation before editing local files. A local edit does not authorize an Apollo settings write.
4. Confirmation gate: tracker settings write. State the exact tracked domain change, any contact-level tracking change, and any optional first-party intent paths with their labels and levels (for example a pricing page as high intent), then obtain a separate explicit user confirmation immediately before the write. Use IDs returned by confirmed lookup; never guess them. Whether the workspace can enable or use contact-level tracking is decided by the discovered Apollo capability and entitlement responses, not by an assumed subscription requirement; surface any returned entitlement or permission blocker honestly.
5. Verify placement by inspecting the edited file and, when possible, the served page. Do not manufacture traffic, synthetic visits, or test events, and do not claim visitors will appear on any specific timeline.

## Identify visiting people first

For existing saved contacts, prefer the discovered saved-contact search when it supports contact-level Website Visitor filters, using only the visitor filters it actually exposes and only tracked domains returned by confirmed tracker lookup. Saved contacts returned by that search may carry a `website_visitor` evidence block directly; when it is present, use that returned evidence as-is and do not run a redundant person enrichment or match call solely to obtain Website Visitor evidence the search already returned. Preserve the exact contact and person IDs Apollo returned.

For net-new people, when a discovered people-search capability supports Website Visitor filters, run person-level discovery before any company-level search. Query only tracked domains returned by confirmed tracker lookup, and use only the Website Visitor filters that capability actually supports — such as visited-domain, recency window, first-party intent level, confidence tier, visited or exact pages, page-view counts, new-people-only, or last-visited-at sorting, whichever are exposed. In the current client these visitor-filtered searches are read-only and do not consume credits, so they need no credit confirmation unless discovered capability metadata says otherwise; if metadata reports a cost or mutation, gate it accordingly.

People returned by the visitor-filtered people search may truthfully be described as identified Website Visitors who matched the applied filters. That search response does not itself return per-person visit evidence: it does not prove or display an exact last-visit time, visit count, visited pages, a confidence value, or a per-person intent value, and those facts must never be restated from the filters that were applied — matching a high-intent filter is not "visited the pricing page yesterday". Never fabricate visit dates, visit counts, visited pages, confidence, or intent, and do not reveal or imply email or phone data the response did not return. Preserve each returned person ID and its organization information for handoff.

When concrete visit evidence is needed for a net-new identified person and a discovered person enrichment or match capability supports it, that call may return the same additive `website_visitor` evidence block — `website_last_visit`, `website_total_visits`, and `website_intent` (a 90-day intent rollup). The block is capability- and entitlement-dependent: claim last visit, total visits, or website intent only when Apollo actually returned those fields, and use only the fields it returned. Give any credit-consuming enrichment or match call its own explicit confirmation first; reading returned Website Visitor evidence adds no incremental credit charge on top of that call.

When contact-level Website Visitor search is unavailable, denied, unsupported, fails closed, or returns no usable contact-level result, state that plainly and continue with the company-level fallback below; never present company-level results as identified people.

## Company-level fallback: query named visiting accounts

Confirmation gate: credit-consuming visitor search. The company search capability consumes credits; disclose that before running it, obtain explicit user confirmation, and never silently substitute a different paid search or quietly broaden the filters that were confirmed.

Query only through website visitor filters actually supported by the discovered company-search capability: the team's confirmed tracked domain, a supported recency window, and optional first-party intent level or visited-page filters. Read the response as two distinct buckets and keep their IDs straight: in `organizations`, `id` is the Apollo organization ID of a net-new company; in `accounts`, `id` is the saved Apollo account ID and `organization_id` carries that account's Apollo organization ID. Never pass an account `id` where an organization ID is required.

Company-level results mean someone at that company visited, never that a particular employee did. Never run a generic people search against a visiting company and relabel its employees as Website Visitors.

Zero visiting people or companies, a missing website visitors entitlement, exhausted visitor credits, or an uninstalled pixel must produce an honest empty state or stated blocker; never fabricate visitors, visit counts, or intent levels.

Optional per-company visit detail (visit counts, unique visitors, top visited paths) is allowed only when a valid `organization_id` from returned results or a discovered enrichment capability is available together with a confirmed tracked domain, and the tracked domain is always the user's own site, never the visiting company's domain.

## Hand off to outbound

For identified people, hand off the exact returned contact or person IDs with their organization information into the follow-on outbound workflow; do not discard the person-level signal and restart from generic company prospecting. Contact creation, private-data reveal, enrollment, sequence creation, activation, and sending remain separately gated downstream steps, and one approval never covers a later credit-consuming or mutating step.

For company-only results, present the named visiting accounts with the visit and intent context outbound can act on — recency window, first-party intent level, visited pages, and whether each is a net-new organization or an existing saved account — and hand off their organization IDs and domains.

For the next outbound step, prefer the `/apollo:prospect` skill (and the sequence-safety skills) when available. If those skills are absent, do not invent them and do not take on prospecting, contact creation, enrollment, or sequence launch inside this skill; finish with a clear handoff that lists the person IDs or organization IDs and domains ready for that follow-on workflow.
