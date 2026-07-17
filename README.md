# Apollo MCP Plugin and Public Skills

Connect Apollo.io to Claude Code, Claude Cowork, or Cursor and use five public workflow skills for onboarding, analytics, enrichment, prospecting, and sequence preparation.

The canonical public source for each workflow is `skills/<id>/SKILL.md`. `catalog/skills.json` records the public inventory and required Apollo MCP tools.

## Install

### Claude Cowork

[Install Apollo in Cowork](https://claude.ai/desktop/customize/plugins/new?marketplace=apolloio/apollo-mcp-plugin&plugin=apollo), then restart Cowork.

### Claude Code

Run these commands in Claude Code:

```text
/plugin marketplace add apolloio/apollo-mcp-plugin
/plugin install apollo@apollo-plugin-marketplace
```

Restart Claude Code, run `/mcp`, select Apollo, and authenticate with OAuth in the browser.

### Cursor

Open the Cursor Plugin Marketplace, search for Apollo, install the plugin, and authenticate with Apollo.io when prompted.

An MCP connection does not by itself prove that these workflow skills are installed or discoverable. Use the installation and discovery controls provided by the current client, and verify the five skills by name before relying on them.

## Public Skills

| Skill | Purpose | Safety boundary |
|---|---|---|
| `onboarding` | Verify Apollo MCP and choose a workflow | Read-only verification |
| `analytics` | Answer sales performance questions | Read-only reporting |
| `enrich-lead` | Resolve and enrich one lead | Separate credit, private-data, and contact-write approvals |
| `prospect` | Turn an ICP into a ranked shortlist | Search first; separate enrichment, reveal, and write approvals |
| `sequence-load` | Prepare and enroll selected contacts | Separate credit, reveal, write, enrollment, activation, and send approvals |

The skills are optional. Apollo MCP remains usable without them.

## Search and Credit Behavior

- Use `apollo_organizations_lookup` for free, shallow name/domain candidate and Apollo organization-ID resolution after that tool is released.
- Use `apollo_mixed_companies_search` for filtered company prospecting. It costs exactly 1 credit when a request returns results and requires this confirmation immediately before the call: `This will consume 1 credit. Do you want to proceed?`
- Search and preview before requesting credit-consuming detail.
- Ask separately before revealing private contact data or creating Apollo records.
- Treat sequence enrollment, activation, and direct sending as separate live-outreach decisions.
- Stop when a required capability is unavailable; do not invent a tool, result, installation state, or fallback.

## Model Recommendation

For complex, long-running prospecting and orchestration, use the most capable Claude model available in your client, currently Claude Fable 5. Use the current Sonnet model for faster lookups and smaller workflows. In Claude Code, use `/model` to select from the models available to your account; this repository does not assume an unsupported model alias.

## Runtime Release Gate

Publish `v0.2.0` only after every tool and parameter used by a public skill matches the production Apollo MCP surface and the corresponding Leadgenie checks pass. In particular, `prospect` depends on the proposed free `apollo_organizations_lookup` contract in Leadgenie PR #97251. Until that contract is merged and deployed, the skill must report that free organization lookup is unavailable rather than substitute the paid company-search tool.

Phone reveal remains optional and may run only when the active tool descriptions expose a complete reveal-and-poll contract. Never claim installation, discovery, enrichment, reveal, or a write without verification.

## Validation

Run the dependency-free repository check:

```text
node scripts/validate-skills.mjs
```

It validates the five-skill inventory, frontmatter, UTF-8 encoding, public-content hygiene, declared tool references, and plugin release versions. This release intentionally contains no installer, internal evaluation artifacts, private skills, generated packages, package-manager files, lockfiles, or public platform-support matrix.

## Troubleshooting

- If Apollo is not listed in `/mcp`, restart the client and confirm the plugin is enabled.
- If authentication is required, reconnect Apollo and complete OAuth in the browser.
- If a skill is missing, verify the client installed and discovered the skill files; MCP connectivity alone is not proof of skill delivery.
- If a required Apollo tool is missing, stop that workflow and report the unavailable capability.

## License

MIT. See `LICENSE`.
