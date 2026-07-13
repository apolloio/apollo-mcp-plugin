---
name: analytics
description: "Answer read-only Apollo sales analytics questions about email, calls, meetings, tasks, opportunities, sequences, and conversations. Use when comparing performance, finding trends, ranking results, or building a report."
---

# Analytics

Turn a sales-performance question into one or more read-only Apollo reports. Never create, update, enroll, activate, or send anything in this workflow.

## 1. Interpret

Identify the requested metrics, date range, grouping, pivot, filters, and sort order. If no time range is given, use the last 30 days and state that assumption. Use the current date to resolve relative periods.

Choose a small set of metrics that directly answers the question. Preserve these distinctions:

- Logged call attempts differ from connected calls.
- Scheduled meetings may include cancellations; held meetings occurred.
- Overdue tasks may include work completed late; unfinished overdue tasks remain pending.
- Pipeline amount, won amount, and revenue amount answer different questions.
- Rates should be paired with useful underlying counts when possible.

## 2. Confirm Read-Only Tools

Use `apollo_analytics_sync_report` for reports. Use `apollo_emailer_campaigns_search` only when a sequence name must be resolved to a filter identifier.

Follow the parameter types exposed by the tools. For sequence paging, start with page 1 and a small page size. If the server rejects the visible schema, report a tool/schema blocker instead of retrying with guessed parameter shapes. If the report tool is absent, stop and do not invent data.

## 3. Build the Report

Prefer a supported date preset; use explicit start and end dates only when the visible schema supports them. Do not combine a preset and a custom range.

Use one grouping for ordinary breakdowns, such as time, user, team, sequence, account, stage, task type, or conversation type. Use a pivot only for a requested cross-tab. For ranked questions, sort by a metric included in the report.

Resolve names through read-only lookup before filtering by identifiers. Use multiple focused report calls when separate dimensions would make one report ambiguous.

## 4. Present

Use seller-facing labels rather than raw metric identifiers. For an ungrouped result, return a metric/value table. For grouped results, put the grouping first; for pivots, use one table per metric.

Always format percentages and large numbers clearly, state the date range, identify assumptions, and mention truncation or pagination. Add a short evidence-based observation when useful. Offer only read-only follow-ups such as another range, grouping, metric, or copyable table.
