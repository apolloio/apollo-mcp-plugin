# Apollo MCP Plugin

Connect the [Apollo.io](https://www.apollo.io/) MCP Server to Claude Code, Cowork, and Cursor to prospect, enrich leads, prepare outreach sequences, and query sales analytics.

- Fast to install.
- Powerful in execution.
- Designed for real GTM workflows.

---

## One-Click MCP Server Integration

This repository packages the Apollo MCP integration for Claude Code, Cowork, and Cursor. Install the plugin for your client, authenticate with Apollo, and start working with Apollo in your agent.

It also includes reusable Apollo workflow skills. Skill discovery and loading depend on the capabilities of each client; connecting the MCP makes Apollo tools available but does not guarantee that every client automatically installs or invokes these skill files.

---

## Powerful Skills

High-value skills that guide Apollo workflows from a user's goal to a safe, useful outcome.

| Skill | What it does |
| --- | --- |
| `/apollo:onboarding` | Learn Apollo MCP capabilities, run safe first checks, and choose the right workflow. |
| `/apollo:enrich-lead` | Match and enrich a lead with explicit credit confirmation. |
| `/apollo:prospect` | Describe your ICP and get a ranked, search-first prospect shortlist. |
| `/apollo:sequence-load` | Prepare contacts for a sequence with separate approval before real-world changes. |
| `/apollo:analytics` | Ask sales performance questions and get read-only Apollo analytics. |
| `/apollo:inbound-website-visitors` | Set up Apollo website visitor tracking with explicit setup, update, and email gates. |

### `/apollo:onboarding`

Best for: getting oriented, testing the connection safely, and choosing the right Apollo workflow.<br>
Input: a question or workflow<br>
Output: capability menu, risk-level guidance, safe first test, and recommended specialist skill

### `/apollo:enrich-lead`

Best for: one-off enrichment and fast lead lookups.<br>
Input: name, company, LinkedIn URL, or email<br>
Output: likely matches first, then enriched profile and suggested next steps after confirmation

### `/apollo:prospect`

Best for: turning an ICP into a search-first shortlist.<br>
Input: ICP description (industry, size, geography, titles)<br>
Output: ranked prospect table; enrichment is offered only after confirmation

### `/apollo:sequence-load`

Best for: safely preparing contacts for a sequence.<br>
Input: targeting criteria and target sequence<br>
Output: candidate preview with separate gates for enrichment, contact creation, enrollment, and activation

### `/apollo:analytics`

Best for: answering performance questions without opening a dashboard.<br>
Input: any question about emails, calls, meetings, tasks, opportunities, sequences, or conversation intelligence<br>
Output: formatted tables with Apollo data, broken down by rep, team, time, sequence, stage, or another supported dimension

### `/apollo:inbound-website-visitors`

Best for: setting up Apollo website visitor tracking on a site.<br>
Input: website or domain context<br>
Output: tracker status, official install guidance when available, and gated update or email steps

Important: sequence enrollment may trigger outbound depending on sequence settings and sending configuration.

---

## Model Recommendations

Recommended: Opus for complex prospecting workflows, ambiguous matches, and multi-step orchestration.

Use Sonnet when speed matters for quick lookups, smaller jobs, or rapid iteration. In Claude Code, switch models with `/model`.

---

## Installation

### Cowork

[Install in Cowork](https://claude.ai/desktop/customize/plugins/new?marketplace=apolloio/apollo-mcp-plugin&plugin=apollo)

Then restart Cowork to ensure the MCP server starts correctly.

### Claude Code

1. Add this plugin's marketplace:

```text
/plugin marketplace add apolloio/apollo-mcp-plugin
```

2. Install the plugin:

```text
/plugin install apollo@apollo-plugin-marketplace
```

3. Restart Claude Code.

### Cursor

1. Open Cursor and go to the Plugin Marketplace.
2. Search for "Apollo" and install the plugin.
3. Authenticate with your Apollo account when prompted.

---

## Authentication

The Apollo MCP Server supports OAuth:

1. After installation, run `/mcp` in Claude Code or connect to the Apollo connector from settings.
2. Select the Apollo server and click **Authenticate**.
3. Complete the Apollo login in your browser.

---

## Apollo Credits and Safety

Some operations consume Apollo credits:

- People enrichment typically costs one credit per person.
- Bulk enrichment consumes credits based on the number of people enriched.

This plugin asks for confirmation immediately before credit-consuming actions.

Sequence safety:

- Adding contacts to a sequence can enroll them into an active sequence.
- Depending on sequence settings, outbound may start automatically.
- Verify the sequence name, sending account, and enrollment volume before confirming.

---

## Quickstart Examples

- `Find VP Sales at SaaS companies with 200-1,000 employees that raised funding in the last six months. Show search results first and confirm before charging credits.`
- `Prepare the top ten matched prospects for my sequence called Q1 Enterprise Outbound. Show a preview and ask separately before enrichment, contact creation, enrollment, or activation.`
- `Show email and call performance by rep for this quarter, sorted by calls made.`

---

## Credits

- MCP Server by [Apollo.io](https://www.apollo.io/)
- Plugin Specification by [Anthropic](https://docs.anthropic.com/)

---

## License

MIT - see [LICENSE](LICENSE) for details.
