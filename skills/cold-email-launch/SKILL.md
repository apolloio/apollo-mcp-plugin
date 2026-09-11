---
name: cold-email-launch
description: Use when a Replit builder wants to start cold email outbound for the app they are building; inspect the app, judge outbound fit, derive an ICP, prospect through the public Apollo skills when installed or directly through discovered Apollo capabilities, and prepare a reviewed inactive first sequence behind distinct approval gates.
---

# Cold Email Launch

> This skill is designed to run inside a Replit workspace with Replit Agent — it reads your app's codebase and project context directly. Import it into Replit rather than running it elsewhere.

Guide a Replit builder from their current app to a small reviewed prospect shortlist and an inactive first outbound sequence. Act like a pragmatic GTM partner, not a tool wrapper. Treat every Apollo capability as conditional: rely only on capabilities and metadata discovered in the current Apollo client, and never invent a tool name, capability, credit cost, prospect result, or Apollo ID.

## Inspect the Replit app

Infer the business from the project itself before asking the builder anything: read the code, README, landing copy, pricing or billing configuration, and deployment hints. Derive what the product does, the likely customer or user, the motion (B2B, B2C, marketplace, developer tool, or other), the problem solved, visible monetization clues, geographic or regulatory constraints, and the likely buyer if one exists. Do not require the builder to supply an ICP first. State inferences as brief, correctable assumptions.

## Outbound-fit gate

Classify the app as Strong outbound fit, Conditional outbound fit, or Poor outbound fit, and explain the reasoning. Favor outbound when there is an identifiable buyer, a reachable business population, enough customer value to justify outbound, and a credible reason to contact the prospect.

For a Poor fit — low-value consumer, viral, purely self-serve, or otherwise structurally weak — say why and stop before any Apollo credit use or workspace object creation; suggest a better-suited growth motion instead. For a Conditional or ambiguous fit, present the plausible interpretations, surface the assumptions each depends on, and let the builder correct them before proceeding.

## Derive the ICP

Translate the app into account criteria: industry, company size, geography, buyer titles and seniority, useful technology or business signals, exclusions, and a recommended small initial volume. Show the full ICP and get the builder's agreement before any credit-consuming, private-data, or Apollo-mutating action.

## Prospect

Prefer delegating prospecting to the public `prospect` skill with the agreed ICP when that skill is discovered in the current Agent environment; do not rebuild its workflow when it is available. If it is not installed, do not stop for that reason alone: fall back to the Apollo capabilities discovered in the current client and run the same workflow directly — search first, use free shallow organization discovery when the client supports it, then find and rank relevant people against the agreed ICP.

On either path keep these launch defaults: never silently substitute a credit-consuming company search for free discovery; keep email addresses and phone numbers hidden by default; keep credit, private-data reveal, and contact-write approvals distinct; and land on a small ranked shortlist the builder reviews, not a bulk export. If the underlying Apollo search capabilities themselves are unavailable in the current client, state that blocker and stop at planning-level guidance.

## Create the first sequence

The builder is not expected to have an existing sequence. First discover whether the current Apollo client exposes a sequence-creation capability; if it does not, stop at a reviewed sequence plan and say creation is unavailable.

1. Derive the sequence from the app's value proposition and the agreed ICP. Keep a first launch simple: a few short plain emails with one clear ask, spaced days apart.
2. When sequence search is available, check for existing sequences with the same or similar names and surface near-duplicates before creating anything.
3. Present the proposed audience, goal, tone, cadence, subject lines, and full message bodies for review.
4. Confirmation gate: sequence creation. After explicit confirmation of that exact content, create the sequence inactive. Never create or activate a live sequence silently; if inactive creation cannot be guaranteed, stop and say so.

## Enroll contacts

Apply the public `sequence-load` safety model to contact creation and enrollment whether or not that skill is installed; do not weaken it. Prefer delegating to it when it is discovered in the current Agent environment; otherwise run the same gated steps directly through discovered Apollo capabilities, and fail closed if the underlying contact or enrollment capability is itself unavailable. Sequence-creation approval does not imply contact-creation approval, enrollment approval, activation approval, or direct-send approval — each is its own gate.

Confirmation gate: contact write. Confirm which reviewed prospects become Apollo contacts before writing them.

Confirmation gate: enrollment. Confirm the sequence, the exact contacts, and the sender mailbox from a discovered sender-account lookup, then enroll with contacts paused or inactive where the client supports it.

## Activate

Confirmation gate: activation. Require a separate explicit confirmation after the builder has reviewed the sender mailbox, the selected prospects, the full sequence content, and the schedule and cadence. Never infer activation permission from a request like "launch outbound," "just start emailing people," or "set this up" — treat such requests as intent to begin the gated workflow, then walk each gate in order.

## Safety rules

- Never fabricate prospect results or report actions that did not run.
- Never spend Apollo credits, reveal private contact data, write contacts, enroll contacts, activate, or send without the separate explicit approval for that specific step; one approval never covers the next.
- Prefer capability discovery and current Apollo client metadata over hard-coded assumptions; if a needed capability is missing, state the blocker and continue only with planning-level guidance.
