# Proposal: `/apollo:icp-job-changes` skill

**Status:** Draft for public repository consideration.

## What it does

The skill takes a batch of Apollo job changes, scores each person's *new company* against the customer's own ICP rubric, and writes a CSV approval sheet with a `fit`, `review`, or `skip` decision and a one-line reason for every row. Contacts are only created for rows the user explicitly approves. It generalizes a workflow first built for a managed account.

## Skill vs plugin: why a skill

- **The repository is already one plugin.** `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` define a single `apollo` plugin. The plugin loads everything in `skills/` and already wires up the remote Apollo MCP server through `.mcp.json`. Every existing workflow (`prospect`, `enrich-lead`, `sequence-load`, `analytics`, `gtm-strategist`) is a skill inside that plugin.
- **Nothing new is needed at the plugin level.** The workflow uses Apollo MCP tools that existing skills already reference (`apollo_organizations_bulk_enrich`, `apollo_mixed_companies_search`, `apollo_people_bulk_match`, `apollo_contacts_create`). It needs no new MCP server, hooks, or agents, and no extra manifest.
- **Customers get it automatically.** Anyone who installs `apollo@apollo-plugin-marketplace` gets `/apollo:icp-job-changes` with no extra setup.

A separate plugin would only make sense if the workflow needed its own MCP server or a bundled runtime, such as the original standalone script. See the open questions below.

## How "customers use their own keys" maps here

| Original kit | This skill |
|---|---|
| Customer's Apollo API key | The customer's Apollo OAuth session on the Apollo MCP server. No key handling. |
| Customer's Claude key | The customer's own Claude Code or Cowork session, on their own plan or API key. |
| Weekly approval sheet | `icp-approval-YYYY-MM-DD.csv`, re-run with `approve <sheet>`. |
| Only good fits get created | Step 7 writes only `approve = yes` rows, after a preview and confirmation. |

## Files

- `skills/icp-job-changes/SKILL.md`: the workflow.
- `skills/icp-job-changes/references/icp-rubric-template.md`: the customer-owned rubric template (disqualifiers, weights, thresholds).
- `skills/icp-job-changes/references/approval-sheet.md`: input and output columns, weekly cadence, keys, and an illustrative sample result.
- `README.md`: skill table and layout row.

## Customer-safety choices

- No credentials, customer names, or customer data are included. The rubric is a blank template.
- Steps 1 to 6 change nothing in Apollo. Enrichment gets a credit notice and confirmation, and contact creation gets a preview and confirmation.
- The original test result (153 of 348 job changes skipped) is described as an illustrative internal test, not a guarantee. The "about 50% credit savings at scale" estimate is not repeated, because it has not been validated across customers.
- The skill never sends outreach. Sequencing is an optional handoff to `/apollo:sequence-load`.

## Open questions for reviewers

1. **Job-change source.** None of the existing skills use an Apollo MCP tool that returns job changes. Today the skill reads an exported CSV, and only uses a job-change tool if the connected server actually provides one. If the MCP server has, or adds, such a tool, name it explicitly in Step 1.
2. **Original script.** The standalone script and install kit from the original thread were not available to the author of this draft, so nothing from them is included. If a scheduled, headless version is wanted, review the script for secret handling and add it under `skills/icp-job-changes/scripts/`, or as a separate plugin if it needs its own runtime.
3. **Versioning.** The plugin and server versions are unchanged, because bumping `server.json` triggers a registry publish. Bump them when this is accepted for release.
4. **Cursor parity.** The Cursor manifest already points to `./skills/`, so the skill should load there too. Not yet tested in Cursor.
