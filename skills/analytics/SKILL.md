---
name: analytics
description: "Instant sales analytics. Ask any performance question — emails, calls, meetings, tasks, opportunities, sequences, conversation intelligence — and get formatted tables with real Apollo data."
user-invocable: true
argument-hint: [your analytics question]
---

# Analytics

Answer any sales performance question using Apollo's analytics data. The user asks a question via "$ARGUMENTS".

## Examples

- `/apollo:analytics How many emails did I send last 30 days?`
- `/apollo:analytics Show me team call connect rate this quarter by rep`
- `/apollo:analytics What's our email reply rate week over week for this year?`
- `/apollo:analytics Break down pipeline and won amount by opportunity stage all time`
- `/apollo:analytics Which sequences have the highest reply rate in the last 6 months?`
- `/apollo:analytics Show me activity summary — emails, calls, meetings, tasks — for each rep this quarter`
- `/apollo:analytics How are calls trending by day of week over the last 3 months?`
- `/apollo:analytics Show me emails sent vs replied broken down by contact stage and email type`

## Step 1 — Interpret the Question

Parse "$ARGUMENTS" to determine the following parameters:

---

### Metrics

Select 1–15 metrics that match what the user is asking about. Always include the rate/percent version alongside raw counts when the user asks about performance.

**Email**
`num_emails_sent`, `num_emails_delivered`, `num_emails_opened`, `num_emails_clicked`, `num_emails_replied`, `num_emails_bounced`, `num_emails_unsubscribed`, `percent_emails_replied`, `num_contacts_emailed`, `num_contacts_opened`, `num_contacts_replied`

**Calls**
`num_phone_calls`, `num_phone_calls_completed`, `num_phone_calls_connect`, `num_phone_calls_connect_positive`, `num_phone_calls_connect_negative`, `num_phone_calls_connect_neutral`, `percent_phone_calls_connect`, `avg_phone_call_duration`, `num_contacts_called`

Key distinctions:
- `num_phone_calls_completed` = all logged attempts
- `num_phone_calls_connect` = recipient actually answered
- `num_phone_calls_connect_positive/negative/neutral` = connected calls by outcome sentiment

**Meetings**
`num_all_meetings_scheduled`, `num_meetings_held`, `num_all_meetings_rescheduled`, `num_calendar_events_scheduled`, `num_calendar_events_cancelled`, `num_all_meetings_scheduled_via_email`, `num_all_meetings_scheduled_via_call`

Key distinctions:
- `num_all_meetings_scheduled` = includes cancelled
- `num_meetings_held` = actually occurred

**Tasks**
`num_tasks`, `num_tasks_completed`, `num_tasks_scheduled`, `num_tasks_completed_on_time`, `percent_tasks_completed`, `percent_tasks_completed_on_time`, `overdue_tasks`, `unfinished_overdue_tasks`

Key distinctions:
- `overdue_tasks` = all overdue including completed late
- `unfinished_overdue_tasks` = still pending and overdue

**Contacts & Accounts**
`num_contacts`, `num_accounts`, `num_contacts_touched`, `num_accounts_touched`, `num_net_new_people`, `num_net_new_companies`, `num_contacts_with_job_change`

**Opportunities**
`num_opportunities`, `num_won`, `num_closed`, `deal_amount`, `won_amount`, `pipeline_amount`, `revenue_amount`, `avg_deal_amount`, `avg_won_amount`, `percent_win_rate`, `avg_salescycle_days`

**Sequences**
`num_contacts_added_to_sequence`, `num_contacts_remove_from_sequence`

**Conversation Intelligence**
`num_conversations_recorded`, `num_conversations_listened`, `avg_conversation_duration`, `total_conversation_duration`, `avg_talk_ratio`, `avg_question_rate`, `avg_longest_monologue`, `speaker_switches`

**LinkedIn**
`num_linkedin_tasks_scheduled`, `num_linkedin_tasks_completed`, `num_linkedin_tasks_skipped`, `percent_linkedin_tasks_completed`

---

### Date Range

Map the user's time reference to a preset modality (preferred) or a custom range:

**Presets**: `today`, `yesterday`, `current_week`, `current_month`, `current_quarter`, `current_year`, `last_7_days`, `last_2_weeks`, `last_30_days`, `last_3_months`, `last_6_months`, `last_12_months`, `last_4_quarters`, `last_2_years`, `previous_week`, `previous_month`, `previous_quarter`, `previous_year`, `all_time`

**Custom**: use `range_start` + `range_end` (YYYY-MM-DD) for specific date windows. Do not combine with a modality.

Default to `last_30_days` if no time reference is given.

---

### Breakdown (group_by)

Does the user want data broken down by something? Set `group_by` to one of:

**Time patterns** (for trends and time series)
`smart_datetime_hour`, `smart_datetime_day`, `smart_datetime_week`, `smart_datetime_month`, `smart_datetime_year`
`smart_datetime_hour_of_day`, `smart_datetime_day_of_week`, `smart_datetime_month_of_year`

**People & Teams**
`smart_user_id` (by rep), `smart_subteam_id` (by team)

**Email dimensions**
`emailer_campaign_id` (by sequence), `emailer_template_id` (by template), `emailer_message_type`, `emailer_step_id`, `emailer_touch_id`, `send_from_email`, `send_from_domain`, `email_account_id`

**Calls**
`phone_call_outcome_id`, `phone_call_purpose_id`, `phone_call_sentiment`

**Contact attributes**
`contact_stage_id`, `contact_label_ids`, `contact_owner_id`, `persona`, `person_title_unanalyzed`, `person_seniority`, `person_location_country`, `person_location_state`, `person_location_city`

**Account & company attributes**
`account_id`, `account_stage_id`, `account_label_ids`, `account_owner_id`, `organization_industries`, `organization_num_current_employees`, `organization_hq_location_country`, `organization_hq_location_state`, `organization_hq_location_city`, `organization_latest_funding_stage_cd`, `organization_current_technologies`

**Opportunities**
`opportunity_stage_id`, `opportunity_owner_id`, `opportunity_pipeline_id`, `forecast_category`, `lead_source`, `opportunity_deal_source`

**Tasks**
`task_type`, `task_status`

**Conversations**
`conversation_state`, `conversation_type`, `tracker_names_unanalyzed`, `calendar_event_setting_type`

Omit `group_by` entirely for a flat summary (single row of totals).

---

### Pivot (pivot_group_by)

If the user wants a cross-tab (e.g. "by rep AND by sequence", "broken down by stage vs email type"), set `group_by` to the primary dimension and `pivot_group_by` to the secondary. The tool returns one table per metric when a pivot is used. Prefer low-cardinality dimensions (e.g. `emailer_message_type`, `contact_stage_id`, `phone_call_sentiment`) as the pivot.

---

### Filters

- "my data" / "for me" / "my performance" → `filters: { user_id: ["current"] }`
- "team" / no user mention → omit filters entirely (returns team-wide data)

---

### Sort

If the user asks "who has the most...", "ranked by...", or "top reps by...", set:
```
sort: { metric: "<metric_name>", asc: false }
```
Use `asc: true` for "lowest first" or "worst performing" queries.

Two constraints:
- Sort only applies when `group_by` is set — it has no effect on flat queries
- The sort metric must be included in the `metrics` array

---

## Step 2 — Call the Analytics Tool

Use `mcp__claude_ai_Apollo_MCP__apollo_analytics_sync_report` with the parameters determined above.

If the question spans multiple independent dimensions (e.g. "show me email metrics by rep AND separately by sequence"), make two sequential calls.

If the question is ambiguous, make a reasonable default call first, then offer to refine.

---

## Step 3 — Present the Results

**Flat response** (no group_by): Present as a clean two-column summary table — metric name and value.

**Grouped response** (group_by only): Present as a table with the dimension as the first column and metrics as subsequent columns. Highlight notable outliers (top performer, lowest rate, biggest gap).

**Pivot response** (group_by + pivot_group_by): Present each metric as a separate labeled table. Add a brief summary sentence per table.

Always:
- Convert decimals to readable percentages (e.g. `0.14` → `14%`)
- Format large numbers with commas
- If the response says "Showing first N of M rows", mention the total count and offer to refine
- Add 1–2 sentences of insight after the data (e.g. "Tuesday has the highest call volume at 355 calls", "Sarah Flores leads reply rate at 14%")

---

## Step 4 — Offer Follow-up Actions

After presenting results, suggest 2–3 relevant next steps:

1. **Drill deeper** — break down by another dimension (e.g. "want to see this by rep?")
2. **Change date range** — compare with a different time period
3. **Add more metrics** — "want to add meetings or tasks to this view?"
4. **Pivot view** — "want to cross-tab this — e.g. by rep × sequence?"
5. **Export** — format as CSV-style table for copy-paste
