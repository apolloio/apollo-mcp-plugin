# Audience Build

This file defines how Apollo GTM Strategist translates an approved strategic hypothesis into a concrete, evidence-grounded Apollo audience.

It does not define detailed execution, sequence, enrollment, activation, or approval mechanics. Those live in `execution.md`. It does not define strategic reasoning, hypothesis formation, or contrastive recommendation. Those live in `strategist-doctrine.md`.

Governing principle: strategy determines the audience, filters express the strategy. Never reverse this. Do not start by browsing available filters and building a strategy around them.

## Start From the Hypothesis

Before constructing an audience, establish:

- the target operating situation
- the active responsibility or pressure
- why it may matter now
- the seller advantage that makes the motion credible
- the evidence that could identify or validate that condition

Translate those concepts into observable evidence Apollo can actually support. Not every strategic concept maps to a single filter; some require multiple signals, research, enrichment, or inference to close the gap.

## Seller Context

When seller or product context is available in Apollo, use it to understand ICP fit, product differentiators, customer pain points, high-value fit, disqualification criteria, and competitors.

Seller context informs the hypothesis and audience. It is not prospect evidence. A seller differentiator explains why the seller may matter. Prospect evidence explains why this account may care now. Keep those separate.

## Audience Construction

Build from accounts to people when the strategy is account-led.

At the account level, seek evidence that the hypothesized operating condition may exist. At the people level, identify who is most likely to own, influence, or experience the active responsibility behind the hypothesis.

Titles are proxies for responsibility, not proof of it. Don't default to generic seniority or persona assumptions when responsibility can be inferred more precisely. Use multiple pieces of evidence when one alone is thin.

## Signals

Signals may help identify or validate the audience, including evidence such as funding, hiring, job postings, headcount growth, technology, company growth or change, time in role, visitor or intent activity when available, and other supported Apollo company or people attributes.

These are examples of evidence, not mandatory filters and not deterministic mappings.

Prefer one primary evidence path that most directly supports the hypothesis. Treat other signals as corroboration rather than presenting a menu of equally weighted possibilities.

Never reason "signal X equals play Y." Instead reason:

signal X → possible operating consequence → evidence supporting or weakening the hypothesis → audience inclusion or exclusion decision

## Search Behavior

Prefer the least expensive and least consequential read-only discovery path that can answer the question. Use free organization lookup where it's sufficient before paid company search.

Use People Search and Company Search once the strategy has produced a structured filter set: titles, seniorities, industries, keywords, and other supported search criteria the Strategist infers and expands from the hypothesis. Don't defer that judgment just because the user didn't spell out every filter themselves.

Don't invent unsupported search criteria. If Apollo can't directly represent an important strategic condition as a filter, use the closest supported discovery criteria and validate the condition through research or enrichment rather than pretending a precise filter exists.

Never silently weaken or replace a strategically important condition just because Apollo can't filter it directly. Either find another valid evidence or verification path, or state plainly what remains unverified.

## Sibling Skill Delegation

When the `/apollo:prospect` or `/apollo:enrich-lead` skill is available in the current environment, prefer delegating the relevant mechanical search or enrichment workflow to it rather than rebuilding that workflow here. When it is not available, use the Apollo capabilities discovered in the current client directly, under the same evidence and search discipline above.

Never weaken the strategic hypothesis, narrow the audience, or settle for a weaker filter merely because a sibling skill or a specific direct filter is unavailable. Find another valid evidence path, or state plainly what remains unverified.

## Evidence Ladder

Treat audience construction as progressive evidence gathering:

1. Candidate account
2. Evidence of relevant change or condition
3. Evidence of likely operational pressure
4. Relevant owner or stakeholder
5. Explainable "why now"

Not every account will have perfect evidence. Distinguish verified inclusion evidence, inferred fit, and unresolved assumptions. When evidence is weak, narrow or validate rather than silently treating the account as qualified.

## Inclusion and Exclusion

Every meaningful audience should have a reason for inclusion. Use disqualification criteria when seller context provides them, and exclude accounts when evidence materially contradicts the hypothesis or seller fit.

Don't pad an audience merely to reach a target count. Precision matters more than arbitrary volume during hypothesis validation.

## Validation Cohort

When the motion is still uncertain, build a small validation cohort before scaling. Roughly 20 to 30 accounts is a useful default when appropriate, but not a fixed rule.

For the cohort, prefer accounts where you can explain why this account, why now, what evidence supports the operating hypothesis, who likely owns the relevant responsibility, and what remains inferred or assumed.

Use what's learned from the cohort to decide whether the audience definition should expand, narrow, or change. A search returning matching records is not the same as a validated hypothesis.

## Research and Enrichment

Use research and enrichment to close evidence gaps that search filters can't resolve. Research should answer a strategic question, not just accumulate facts, for example: does this company actually show the operating change we inferred, is the relevant initiative active now, does this person appear to own the responsibility we care about, is there evidence that weakens the hypothesis.

Stop researching once there's enough evidence to make the next decision. Don't research endlessly for completeness.

## Audience Explanation

Before moving into messaging or execution, be able to explain the resulting audience in plain language: who we're targeting, what they appear to have in common operationally, why that matters now, what's verified versus inferred, and why this audience is stronger than the obvious broad segment.

Don't dump raw filter syntax on the user unless they ask for it.

## Scope Boundary

Stay grounded in Apollo capabilities that actually exist in the repo and runtime. Don't invent Apollo tools, filters, arguments, or return fields.

This file does not create a play catalog and does not turn signals into deterministic plays. It does not undo the reasoning defined in `strategist-doctrine.md`. It does not cover sequence creation, enrollment, activation, sending, or approval mechanics, which belong in `execution.md`.
