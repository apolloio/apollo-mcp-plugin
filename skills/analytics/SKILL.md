---
name: analytics
description: "Answer Apollo sales analytics questions with read-only reports. Use for performance questions about emails, calls, meetings, tasks, opportunities, sequences, and conversation intelligence."
user-invocable: true
argument-hint: [your analytics question]
---

# Analytics

Answer any sales performance question using Apollo analytics. This skill is read-only. The user asks a question via `$ARGUMENTS`.

## Examples

In Replit, ask for the same workflow in natural language. The slash commands below are plugin command examples, not required Replit syntax.

- `/apollo:analytics How many emails did I send last 30 days?`
- `/apollo:analytics Show me team call connect rate this quarter by rep`
- `/apollo:analytics What's our email reply rate week over week for this year?`
- `/apollo:analytics Break down pipeline and won amount by opportunity stage all time`
- `/apollo:analytics Which sequences have the highest reply rate in the last 6 months?`

## Step 0 - Confirm Available Tools

Use the Apollo tools exposed by the current client. Tool names vary by client.

Needed capabilities:

- analytics report, such as `apollo_analytics_sync_report`
- optional sequence search for resolving sequence-name filters, such as `apollo_emailer_campaigns_search`

When using sequence search, follow the parameter types exposed by the current client for `page` and `per_page`. Some clients expose numeric paging semantics as string-typed schema fields. Use small values such as page 1 and per_page 1, and if the client or server rejects paging because of a schema mismatch, stop and report a `tool/schema` blocker rather than retrying blindly.

If the analytics tool is unavailable, explain the missing capability and do not invent data.

## Step 1 - Interpret the Question

Identify:

- metrics
- date range
- grouping
- pivot grouping, if requested
- filters
- sort order

Default date range:

- Use `last_30_days` if the user gives no time reference.
- Use the current date when resolving relative ranges.

## Step 2 - Choose Metrics

Select 1-15 metrics that match the question. Include rate or percentage metrics alongside raw counts when the user asks about performance.

Use Apollo metric IDs internally, but translate them into seller-facing labels in the response unless the user is debugging a metric mapping. Prefer labels like Reply rate, Meetings booked, Call connect rate, Open rate, Bounce rate, Tasks completed, Pipeline amount, and Win rate.

Common metric names:

- email: `num_emails_sent`, `num_emails_scheduled`, `num_emails_delivered`, `num_emails_opened`, `num_emails_clicked`, `num_emails_replied`, `num_emails_bounced`, `num_emails_unsubscribed`, `percent_emails_replied`, `num_contacts_emailed`, `num_contacts_opened`, `num_contacts_replied`, `email_daily_limit`
- calls: `num_phone_calls`, `num_phone_calls_completed`, `num_phone_calls_connect`, `num_phone_calls_connect_positive`, `num_phone_calls_connect_negative`, `num_phone_calls_connect_neutral`, `percent_phone_calls_connect`, `avg_phone_call_duration`, `num_contacts_called`
- meetings: `num_all_meetings_scheduled`, `num_meetings_held`, `num_all_meetings_rescheduled`, `num_calendar_events_scheduled`, `num_calendar_events_cancelled`, `num_all_meetings_scheduled_via_email`, `num_all_meetings_scheduled_via_call`
- tasks: `num_tasks`, `num_tasks_completed`, `num_tasks_scheduled`, `num_tasks_completed_on_time`, `percent_tasks_completed`, `percent_tasks_completed_on_time`, `overdue_tasks`, `unfinished_overdue_tasks`, `percent_unfinished_overdue_tasks`
- contacts/accounts: `num_contacts`, `num_accounts`, `num_contacts_touched`, `num_accounts_touched`, `num_net_new_people`, `num_net_new_companies`, `num_contacts_with_job_change`
- opportunities: `num_opportunities`, `num_won`, `num_closed`, `deal_amount`, `won_amount`, `pipeline_amount`, `revenue_amount`, `avg_deal_amount`, `avg_won_amount`, `percent_win_rate`, `avg_salescycle_days`
- sequences: `num_contacts_added_to_sequence`, `num_contacts_remove_from_sequence`
- conversations: `num_conversations_recorded`, `num_conversations_listened`, `avg_conversation_duration`, `total_conversation_duration`, `avg_talk_ratio`, `avg_question_rate`, `avg_longest_monologue`, `speaker_switches`
- LinkedIn: `num_linkedin_tasks_scheduled`, `num_linkedin_tasks_completed`, `num_linkedin_tasks_skipped`, `percent_linkedin_tasks_completed`

Key distinctions:

- `num_phone_calls_completed` means logged call attempts; `num_phone_calls_connect` means the recipient answered.
- `num_all_meetings_scheduled` may include cancelled meetings; `num_meetings_held` means meetings that occurred.
- `overdue_tasks` includes completed-late tasks; `unfinished_overdue_tasks` means tasks still pending and overdue.
- `percent_unfinished_overdue_tasks` is the share of scheduled tasks that are overdue and unfinished.
- `email_daily_limit` is the configured daily outbound sending limit. Combine it with email volume and a user, mailbox, or time grouping when comparing activity to that limit.
- `avg_talk_ratio`, `avg_question_rate`, `avg_longest_monologue`, and `speaker_switches` are conversation intelligence metrics.

## Step 3 - Choose Date Range

Use a supported preset when possible:

`today`, `yesterday`, `current_week`, `current_month`, `current_quarter`, `current_year`, `last_7_days`, `last_2_weeks`, `last_30_days`, `last_3_months`, `last_6_months`, `last_12_months`, `last_4_quarters`, `last_2_years`, `previous_week`, `previous_month`, `previous_quarter`, `previous_year`, `all_time`.

For specific date windows, use `range_start` and `range_end` in `YYYY-MM-DD` format if supported by the visible tool schema. Do not combine a preset with custom range fields.

Default to `last_30_days` if the user gives no time reference.

## Step 4 - Choose Groupings

Use `group_by` when the user asks for a breakdown:

- time trends: `smart_datetime_hour`, `smart_datetime_day`, `smart_datetime_week`, `smart_datetime_month`, `smart_datetime_year`, `smart_datetime_hour_of_day`, `smart_datetime_day_of_week`, `smart_datetime_month_of_year`
- people and teams: `smart_user_id`, `smart_subteam_id`
- email and sequences: `emailer_campaign_id`, `emailer_template_id`, `emailer_message_type`, `emailer_step_id`, `emailer_touch_id`, `send_from_email`, `send_from_domain`, `email_account_id`
- calls: `phone_call_outcome_id`, `phone_call_purpose_id`, `phone_call_sentiment`
- contacts: `contact_id`, `contact_stage_id`, `contact_label_ids`, `contact_owner_id`, `persona`, `person_title_unanalyzed`, `person_seniority`, `person_location_country`, `person_location_state`, `person_location_city`
- accounts and companies: `account_id`, `account_stage_id`, `account_label_ids`, `account_owner_id`, `organization_industries`, `organization_num_current_employees`, `organization_hq_location_country`, `organization_hq_location_state`, `organization_hq_location_city`, `organization_latest_funding_stage_cd`, `organization_current_technologies`
- opportunities: `opportunity_id`, `opportunity_stage_id`, `opportunity_owner_id`, `opportunity_pipeline_id`, `forecast_category`, `lead_source`, `opportunity_deal_source`
- tasks: `task_type`, `task_status`
- conversations: `conversation_state`, `conversation_type`, `tracker_names_unanalyzed`, `calendar_event_setting_type`

Use `pivot_group_by` for cross-tabs, such as rep by sequence or stage by email type. Prefer low-cardinality pivot fields like `emailer_message_type`, `contact_stage_id`, or `phone_call_sentiment`.

## Step 5 - Resolve Filters And Sort Safely

If the user asks for a sequence by name, use sequence search only to resolve the ID, then run the analytics report.

Map common filters:

- "my data" or "for me": use current-user filtering if supported by the tool.
- specific users or teams: use user or team IDs only when they are visible from safe context or a confirmed lookup.
- sequence name: resolve to an `emailer_campaign_id` before filtering.

If the user asks for "top", "ranked by", "highest", "lowest", or "worst", sort by a metric already included in the `metrics` array. Sorting usually only matters when `group_by` is present.

Do not create, update, enroll, approve, or activate anything while answering analytics questions.

## Step 6 - Call the Analytics Report

Call the available analytics report tool with the interpreted parameters.

If the question spans separate dimensions, use multiple read-only report calls rather than overloading one request.

If the question is ambiguous, choose a reasonable read-only default and state it briefly.

## Step 7 - Present Results

For flat results, present a two-column table:

| Metric | Value |
|---|---|

For grouped results, use the group as the first column and seller-facing metric labels as subsequent columns.

For pivots, present one table per metric.

Always:

- format percentages clearly,
- format large numbers with commas,
- mention if only the first page or first N rows are shown,
- add a short insight or caveat when useful.

## Step 8 - Offer Read-Only Follow-Ups

Offer follow-ups like:

1. change date range,
2. break down by rep, sequence, account, or stage,
3. add related metrics,
4. export as a copyable table,
5. sketch a dashboard layout for a Replit app using only aggregate data.

Do not offer mutating next actions from this skill.

## Optional Builder Guidance

When the user is building a dashboard or another app, propose UI-ready KPI cards, trend lines, grouped tables, filters, and drilldowns that match the report. Use the analytics report for performance aggregates; when the user needs per-message or full contact detail, use the relevant read-only detail or search capability instead of treating this report as a raw export tool.
