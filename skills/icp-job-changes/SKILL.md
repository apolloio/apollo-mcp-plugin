---
name: icp-job-changes
description: "Weekly ICP filter for job changes. Takes contacts who moved to a new company, scores each new company against your ICP rubric, produces an approval sheet, and only creates the people you approve as good fits."
user-invocable: true
argument-hint: [job changes CSV path or "last 7 days"] [optional: path to ICP rubric]
---

# ICP Job Changes

Score each job change against your ICP before you spend credits or create contacts. The user provides a job-change source and, optionally, an ICP rubric via "$ARGUMENTS".

Apollo actions run in the user's own Apollo workspace, signed in through Apollo OAuth on the MCP server. The ICP scoring happens in the user's own Claude client (their own Claude plan or Anthropic API key). The skill needs no other keys or services, and it never asks for or stores credentials.

## Examples

- `/apollo:icp-job-changes ./job_changes_2026-11-03.csv`
- `/apollo:icp-job-changes ./job_changes.csv rubric=./icp-rubric.md`
- `/apollo:icp-job-changes last 7 days`
- `/apollo:icp-job-changes approve ./icp-approval-2026-11-03.csv`

## Workflow at a glance

1. Load job changes.
2. Load the ICP rubric.
3. Collect the unique new companies.
4. Pull company context.
5. Score each company. People inherit their new company's score.
6. Write the approval sheet. **Stop here and wait for the user.**
7. Create only the approved people.
8. Report the results. Optionally hand off to `/apollo:sequence-load`.

Steps 1 to 6 change nothing in Apollo. Step 7 is the only write, and it needs explicit approval.

## Step 1 — Load Job Changes

Use the first source that applies:

- **CSV path in "$ARGUMENTS".** Read the file. Expected columns are listed in `references/approval-sheet.md` under "Input columns". Map close variants such as `Company` to `new_company_name` or `Website` to `new_company_domain`, and tell the user which mapping you used.
- **Time window ("last 7 days", "this week").** Check whether the connected Apollo MCP server has a tool that returns contact job changes. Only use a tool you can actually see. Do not invent tool names or parameters. If there is no such tool, ask the user to export their job changes from Apollo as a CSV and run the skill again with that file.
- **Re-run with `approve <sheet>`.** Skip to Step 7 with that sheet.

Drop rows that have no new company name and no new company domain, and count them as `skipped: missing company`. Remove duplicate people, matching on LinkedIn URL first, then email, then name plus new company.

## Step 2 — Load the ICP Rubric

The rubric is the customer's own definition of a good fit. Load it from:

1. a `rubric=` path in "$ARGUMENTS", otherwise
2. `icp-rubric.md` in the current working directory, otherwise
3. a short interview. Ask for target industries, employee range, geographies, hard disqualifiers, and 2 or 3 example best-fit customers. Then fill in `references/icp-rubric-template.md`, show it to the user, and offer to save it as `icp-rubric.md` so later runs reuse it.

Never use a built-in or generic ICP in place of the user's rubric. If the rubric has no hard disqualifiers and no thresholds, ask for them before scoring.

## Step 3 — Collect Unique New Companies

Group the job changes by new company, keyed on domain or, when there is no domain, on normalized company name. Score each company once and apply that score to every person who joined it. This is where most of the savings come from, because job changes often cluster at the same companies.

Tell the user: `N job changes → M unique new companies to score.`

## Step 4 — Pull Company Context

For companies that the CSV did not already describe well enough to score, use `mcp__claude_ai_Apollo_MCP__apollo_organizations_bulk_enrich` with batches of domains. If you only have a name, use `mcp__claude_ai_Apollo_MCP__apollo_mixed_companies_search` to find the domain first.

> **Credit notice**: Before calling enrichment, tell the user how many companies you will enrich, and say that enrichment may consume Apollo credits depending on their plan (see https://docs.apollo.io). Then ask whether to continue. If the user declines, score on the data you already have and mark those rows `low_confidence`.

Keep only the fields the rubric needs, typically industry, employee count, revenue range, HQ location, keywords, and funding stage.

## Step 5 — Score Each Company

Score every unique company against the rubric using the method in `references/icp-rubric-template.md`:

- Apply hard disqualifiers first. Any match means `skip`, and the reason is the disqualifier.
- Otherwise compute a 0 to 100 fit score from the weighted criteria.
- Map the score to a decision with the rubric's thresholds. The defaults are `fit` at 70 or above, `review` from 40 to 69, and `skip` below 40.
- Write a one-line reason that names the criteria driving the score. Use only facts from the input or from enrichment. If a key field is missing, say so and set `confidence: low` instead of guessing.

Then apply the person-level checks from the rubric, if it defines any, such as target titles or seniorities at the new company. A person at a `fit` company whose new title is clearly out of scope becomes `review`, never `fit`.

## Step 6 — Write the Approval Sheet

Write `icp-approval-YYYY-MM-DD.csv` in the current working directory, using the columns in `references/approval-sheet.md`. Pre-fill `approve` with `yes` for `fit`, leave it blank for `review`, and fill `no` for `skip`.

Then show a summary:

---

**ICP Job Changes — [date]**

| | Count |
|---|---|
| Job changes loaded | ... |
| Unique new companies scored | ... |
| Fit (pre-approved) | ... |
| Needs review | ... |
| Skipped (not ICP) | ... |
| Skipped (missing company / duplicate) | ... |

Top skip reasons: ...

| Person | New title | New company | Score | Decision | Reason |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

(Show the `fit` and `review` rows. Include `skip` rows only if the user asks.)

---

**Stop here.** Ask the user to review the sheet. They can edit the `approve` column and re-run with `approve <sheet>`, or reply in chat with something like "approve all fit, plus rows 4 and 9". Do not continue to Step 7 without explicit approval.

## Step 7 — Create Approved People

Read the approval decisions. Only rows with `approve = yes` go ahead.

Before writing anything, show a short preview: how many contacts will be created, and in which Apollo workspace. Mention that creating contacts can trigger CRM sync or workflow automations, depending on how the workspace is configured. Wait for confirmation.

Then, for each approved person:

- If the rubric or the user asked for verified emails or phones, use `mcp__claude_ai_Apollo_MCP__apollo_people_bulk_match` in batches of 10. Give a credit notice first, the same way as in Step 4.
- Create the contact with `mcp__claude_ai_Apollo_MCP__apollo_contacts_create` with `run_dedupe: true`, using the person's new title and new company.

Never create, enrich, or enroll anyone marked `no`, `review`, or blank.

## Step 8 — Report and Next Steps

Report exactly what changed: how many contacts were created, how many were deduped against existing contacts, and how many failed (with each error). Do not claim success for a call that failed.

Show the skip rate for this run: `X of N job changes skipped before any contact creation`. Present it as this run's result, not as a promise for future runs.

Then offer:

1. **Load into a sequence.** Hand off to `/apollo:sequence-load` with the created contact IDs.
2. **Tune the rubric.** If the user overrode several decisions, suggest specific rubric edits, such as a new disqualifier or a changed weight, and offer to update `icp-rubric.md`.
3. **Run weekly.** Point to the "Running weekly" section in `references/approval-sheet.md`.

## Guardrails

- The ICP is the user's own. Do not add your own opinions about fit beyond what the rubric says.
- Separate verified facts (from input or enrichment) from inference in every reason.
- Do not paste the full job-change list or personal data back into chat beyond what the user needs to decide. Keep it in the sheet.
- Follow applicable privacy, marketing, and data-protection laws. This skill only prepares and creates contacts; it never sends outreach.
