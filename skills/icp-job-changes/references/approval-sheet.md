# Approval Sheet and Weekly Operation

## Input columns

The job-change CSV should have one row per person. Only one of `new_company_name` or `new_company_domain` is required, but the other columns improve matching and scoring.

| Column | Required | Notes |
|---|---|---|
| `first_name`, `last_name` | yes | |
| `new_title` | recommended | Used for person-level checks. |
| `new_company_name` | one of | |
| `new_company_domain` | one of | Preferred, because it is the most reliable company key. |
| `previous_company_name` | optional | Context only. Not scored. |
| `linkedin_url` | recommended | Primary dedupe key. |
| `email` | optional | Secondary dedupe key. |
| `change_detected_at` | optional | Lets the skill limit the run to a time window. |

## Approval sheet columns (`icp-approval-YYYY-MM-DD.csv`)

| Column | Description |
|---|---|
| `row` | Stable row number, so you can approve rows by number in chat. |
| `first_name`, `last_name`, `new_title` | From input. |
| `new_company_name`, `new_company_domain` | From input or enrichment. |
| `linkedin_url`, `email` | From input, if present. |
| `company_score` | 0 to 100, from the rubric. |
| `decision` | `fit`, `review`, or `skip`. |
| `reason` | One line naming the criteria or disqualifier behind the decision. |
| `confidence` | `high` or `low`. `low` means key firmographics were missing. |
| `approve` | `yes`, `no`, or blank. Pre-filled as `yes` for `fit` and `no` for `skip`, and left blank for `review`. **Only `yes` rows are created.** |
| `apollo_contact_id` | Filled in after Step 7 for created or deduped contacts. |
| `status` | Filled in after Step 7: `created`, `deduped`, `failed: <error>`, or `not approved`. |

The sheet is a plain CSV, so it opens in Excel, Google Sheets, or Numbers. Edit the `approve` column, save, and run:

```text
/apollo:icp-job-changes approve ./icp-approval-YYYY-MM-DD.csv
```

## Running weekly

Suggested cadence:

1. **Monday:** export last week's job changes from Apollo as a CSV, or use a time window if your MCP client exposes a job-change tool.
2. Run `/apollo:icp-job-changes <file>` and review the sheet. Most teams only need to look at the `review` rows.
3. Approve, then let the skill create the approved contacts.
4. Optionally load them into a sequence with `/apollo:sequence-load`.
5. Every few weeks, look at which decisions you overrode and tighten `icp-rubric.md`.

### Keys and accounts

- **Apollo:** the skill uses the Apollo MCP server, signed in with *your* Apollo account through OAuth. Credits and permissions are your workspace's.
- **Claude:** scoring runs in *your* Claude client, on your own Claude plan or your own Anthropic API key, depending on how you run Claude Code or Cowork.
- There are no shared or vendor-held keys. Never paste API keys into the rubric, the CSV, or chat.

### Unattended runs

The approval step is meant to be a human checkpoint, so this skill is designed to run interactively. If you automate the first half, for example by scheduling Claude Code headless mode to produce the sheet, keep Step 7 manual. Check your client's documentation for how MCP authentication behaves in non-interactive sessions before you rely on it.

## Expected savings

Savings depend entirely on how well your rubric matches your real ICP and on how your job changes are spread across companies. As one illustrative internal test, not a guarantee: 153 of 348 job changes (about 44%) were skipped automatically before any contacts were created. Run the skill on a week or two of your own data and look at the skip counts it reports before you estimate savings for your team.
