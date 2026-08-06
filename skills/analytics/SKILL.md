---
name: analytics
description: "Answer read-only Apollo sales analytics questions about email, calls, meetings, tasks, opportunities, sequences, and conversations. Use when comparing performance, finding trends, ranking results, or building a report."
---

# Analytics

Turn a sales-performance question into one or more read-only Apollo reports. Never create, update, enroll, activate, or send anything in this workflow.

## 1. Interpret the Question

Identify the requested metrics, date range, grouping, pivot, filters, and sort order. Choose 1-15 metrics that directly answer the question. When the user asks about performance, pair a rate or percentage with useful underlying counts when possible.

### Metric Catalog

**Email**

`num_emails_sent`, `num_emails_scheduled`, `num_emails_delivered`, `num_emails_opened`, `num_emails_clicked`, `num_emails_replied`, `num_emails_bounced`, `num_emails_unsubscribed`, `percent_emails_replied`, `num_contacts_emailed`, `num_contacts_opened`, `num_contacts_replied`, `email_daily_limit`

**Calls**

`num_phone_calls`, `num_phone_calls_completed`, `num_phone_calls_connect`, `num_phone_calls_connect_positive`, `num_phone_calls_connect_negative`, `num_phone_calls_connect_neutral`, `percent_phone_calls_connect`, `avg_phone_call_duration`, `num_contacts_called`

- `num_phone_calls_completed` counts logged attempts.
- `num_phone_calls_connect` counts calls where the recipient answered.
- Positive, negative, and neutral connected-call metrics reflect outcome sentiment.

**Meetings**

`num_all_meetings_scheduled`, `num_meetings_held`, `num_all_meetings_rescheduled`, `num_calendar_events_scheduled`, `num_calendar_events_cancelled`, `num_all_meetings_scheduled_via_email`, `num_all_meetings_scheduled_via_call`

- `num_all_meetings_scheduled` can include cancelled meetings.
- `num_meetings_held` counts meetings that occurred.

**Tasks**

`num_tasks`, `num_tasks_completed`, `num_tasks_scheduled`, `num_tasks_completed_on_time`, `percent_tasks_completed`, `percent_tasks_completed_on_time`, `overdue_tasks`, `unfinished_overdue_tasks`, `percent_unfinished_overdue_tasks`

- `overdue_tasks` includes tasks completed late.
- `unfinished_overdue_tasks` counts tasks still pending after their due date.
- `percent_unfinished_overdue_tasks` uses scheduled tasks as its denominator.

**Contacts and Accounts**

`num_contacts`, `num_accounts`, `num_contacts_touched`, `num_accounts_touched`, `num_net_new_people`, `num_net_new_companies`, `num_contacts_with_job_change`

**Opportunities**

`num_opportunities`, `num_won`, `num_closed`, `deal_amount`, `won_amount`, `pipeline_amount`, `revenue_amount`, `avg_deal_amount`, `avg_won_amount`, `percent_win_rate`, `avg_salescycle_days`

Keep pipeline amount, won amount, and revenue amount distinct because they answer different questions.

**Sequences**

`num_contacts_added_to_sequence`, `num_contacts_remove_from_sequence`

**Conversation Intelligence**

`num_conversations_recorded`, `num_conversations_listened`, `avg_conversation_duration`, `total_conversation_duration`, `avg_talk_ratio`, `avg_question_rate`, `avg_longest_monologue`, `speaker_switches`

**LinkedIn**

`num_linkedin_tasks_scheduled`, `num_linkedin_tasks_completed`, `num_linkedin_tasks_skipped`, `percent_linkedin_tasks_completed`

### Date Range

Prefer one supported preset:

`today`, `yesterday`, `current_week`, `current_month`, `current_quarter`, `current_year`, `last_7_days`, `last_2_weeks`, `last_30_days`, `last_3_months`, `last_6_months`, `last_12_months`, `last_4_quarters`, `last_2_years`, `previous_week`, `previous_month`, `previous_quarter`, `previous_year`, `all_time`

Pass a preset as `date_range: { modality: "<preset>" }`. For a specific window, pass `date_range: { range_start: "YYYY-MM-DD", range_end: "YYYY-MM-DD" }` only when the visible schema supports it. Never combine a preset with a custom range. If the user gives no range, use `last_30_days` and state that assumption. Resolve relative periods using the current date.

### Grouping

Omit `group_by` for a flat total. For an ordinary breakdown, pass one supported value in an array, such as `group_by: ["smart_user_id"]`.

**Time and trends**

`smart_datetime_hour`, `smart_datetime_day`, `smart_datetime_week`, `smart_datetime_month`, `smart_datetime_year`, `smart_datetime_hour_of_day`, `smart_datetime_day_of_week`, `smart_datetime_month_of_year`

**People and teams**

`smart_user_id`, `smart_subteam_id`

**Email**

`emailer_campaign_id`, `emailer_template_id`, `emailer_message_type`, `emailer_step_id`, `emailer_touch_id`, `send_from_email`, `send_from_domain`, `email_account_id`

**Calls**

`phone_call_outcome_id`, `phone_call_purpose_id`, `phone_call_sentiment`

**Contact attributes**

`contact_id`, `contact_stage_id`, `contact_label_ids`, `contact_owner_id`, `persona`, `person_title_unanalyzed`, `person_seniority`, `person_location_country`, `person_location_state`, `person_location_city`

**Account and company attributes**

`account_id`, `account_stage_id`, `account_label_ids`, `account_owner_id`, `organization_industries`, `organization_num_current_employees`, `organization_hq_location_country`, `organization_hq_location_state`, `organization_hq_location_city`, `organization_latest_funding_stage_cd`, `organization_current_technologies`

**Opportunities**

`opportunity_id`, `opportunity_stage_id`, `opportunity_owner_id`, `opportunity_pipeline_id`, `forecast_category`, `lead_source`, `opportunity_deal_source`

**Tasks**

`task_type`, `task_status`

**Conversations**

`conversation_state`, `conversation_type`, `tracker_names_unanalyzed`, `calendar_event_setting_type`

### Pivot

Use `pivot_group_by` only for a requested cross-tab. Pass both dimensions as arrays, with the primary dimension in `group_by` and the secondary dimension in `pivot_group_by`. Prefer a lower-cardinality value such as `emailer_message_type`, `contact_stage_id`, or `phone_call_sentiment` for the pivot. Expect one table per metric.

### Filters

- For "my" data, use `filters: { user_ids: ["current"] }`.
- For known Apollo user IDs, use `filters: { user_ids: ["<user_id>"] }`.
- For team-wide data with no requested user, omit user filters.
- For a known subteam ID, use `filters: { team_ids: ["<subteam_id>"] }`.
- For a sequence name, use `apollo_emailer_campaigns_search` to resolve the name to an ID, ask the user to choose if zero or multiple candidates remain, then use `filters: { emailer_campaign_ids: ["<id>"] }`.

Use sequence paging parameters exactly as exposed by the current tool schema. Start with page 1 and a small page size.

### Sort

For ranked questions, use:

```text
sort: { metric: "<metric_name>", asc: false }
```

Use `asc: true` for lowest-first questions. Sort only when `group_by` is set, and include the sort metric in the `metrics` array.

## 2. Build the Report

Use `apollo_analytics_sync_report` with only parameters supported by its visible schema. Use multiple focused report calls when independent dimensions would make one report ambiguous.

If a requested metric, grouping, filter, or parameter is not in the visible schema, explain the limitation and ask the user to choose a supported alternative. If the report tool is absent or rejects the visible schema, stop and report the blocker. Do not guess parameter shapes, substitute another tool, or invent data.

## 3. Present the Results

- For a flat response, return a metric and value table.
- For grouped results, put the grouping first and metrics in later columns.
- For a pivot, return one clearly labeled table per metric.
- Use seller-facing labels instead of raw metric identifiers.
- Format percentages and large numbers clearly.
- State the date range, filters, assumptions, pagination, and truncation.
- Add a short evidence-based observation when useful.

Offer only read-only follow-ups, such as another range, grouping, metric, pivot, or copyable table.
