# ICP Rubric Template

Copy this file to `icp-rubric.md` in your working directory and replace the example values with your own. `/apollo:icp-job-changes` reads it on every run. The skill scores companies only against what is written here.

Keep your rubric in your own environment. Do not commit customer names, internal notes, or credentials to a shared repository.

---

## 1. Hard disqualifiers

Any match means `skip`, whatever the score.

- Industry is one of: `<e.g. Government, Education K-12>`
- Employee count below `<e.g. 50>`
- HQ country not in: `<e.g. US, CA, GB>`
- Company is an existing customer or open opportunity: `<yes/no — if yes, provide a domain list file>`
- Company is a competitor: `<domain list>`

## 2. Weighted criteria

Weights should add up to 100. For each company, the skill gives each criterion full, partial, or zero credit and adds up the results.

| Criterion | Weight | Full credit | Partial credit | Zero credit |
|---|---|---|---|---|
| Industry | 30 | `<core industries>` | `<adjacent industries>` | anything else |
| Employee count | 25 | `<e.g. 1,000–20,000>` | `<e.g. 200–999 or 20,001+>` | outside both |
| Geography | 15 | `<primary regions>` | `<secondary regions>` | anything else |
| Revenue range | 15 | `<e.g. $100M–$5B>` | `<adjacent band>` | outside both or unknown |
| Keywords / signals | 15 | `<e.g. "enterprise L&D", "workforce training">` | one weak match | none |

Partial credit means half the weight unless you say otherwise.

## 3. Thresholds

| Decision | Score |
|---|---|
| `fit` | 70 or above |
| `review` | 40 to 69 |
| `skip` | below 40 |

Raise the `fit` threshold if you want fewer, higher-confidence contacts. Lower it if you would rather review more borderline rows.

## 4. Person-level checks (optional)

These apply after the company has been scored.

- Target titles or keywords at the new company: `<e.g. "Learning", "Talent", "HR", "People">`
- Target seniorities: `<e.g. director, vp, c_suite>`
- A person at a `fit` company whose title does not match becomes `review`.

## 5. Enrichment preferences

- Enrich companies that lack firmographics: `<yes / ask each time / no>`
- Enrich approved people for verified email or phone before creating them: `<yes / no>`

## 6. Example best-fit customers (optional)

List 2 or 3 example companies, described generically or by public domain, to help calibrate reasons. Do not include private deal data.

- `<example-domain.com — why it is a great fit>`
