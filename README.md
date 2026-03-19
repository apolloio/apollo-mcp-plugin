# Apollo Plugin for Claude Code and Cowork

Prospect, enrich leads, and add to outreach sequences with [Apollo.io](https://www.apollo.io/) MCP Server
- Fast to install.
- Powerful in execution.
- Designed for real GTM workflows.

---

## 🔌 One-Click MCP Server Integration

This plugin automatically configures the Apollo MCP Server when installed.
No manual server setup or config files.
Install the plugin, authenticate with Apollo, and run `/apollo:*` commands.

---

## ✅ Powerful Skills

High-value skills that chain multiple Apollo APIs into complete workflows:

| Skill | What it does |
|---|---|
| `/apollo:enrich-lead` | Drop a name, LinkedIn URL, or email and get a full contact card with company context and next actions |
| `/apollo:prospect` | Describe your ICP in plain English and get a ranked table of enriched decision-makers |
| `/apollo:sequence-load` | Find leads, enrich them, dedupe, and bulk-add them to an Apollo sequence with a preview before enrollment |
| `/apollo:analytics` | Ask any sales performance question and get formatted tables from real Apollo analytics data |


### `/apollo:enrich-lead`

Best for: one-off enrichment and fast lead lookups. <br>
Input: name, company, LinkedIn URL, or email <br>
Output: enriched profile (role, location, company context) and suggested next steps

### `/apollo:prospect`
Best for: turning an ICP into a shortlist fast. <br>
Input: ICP description (industry, size, geography, titles) <br>
Output: ranked lead table with enriched decision-makers

### `/apollo:sequence-load`
Best for: taking action on a list. <br>
Input: targeting criteria + target sequence <br>
Output: preview of candidates, enrichment + dedupe, then bulk enrollment into the sequence

### `/apollo:analytics`
Best for: answering performance questions without opening a dashboard. <br>
Input: any question about emails, calls, meetings, tasks, opportunities, sequences, or conversation intelligence <br>
Output: formatted tables with real Apollo data, broken down by rep, team, time, sequence, stage, or any other dimension


Important: sequence enrollment may trigger outbound depending on your sequence settings and sending configuration.

---

## 🧠 Model Recommendations (Quality-First)

Recommended: Opus (best quality)

Use Opus when you want the strongest reasoning and the most reliable multi-step tool orchestration.

- Best for: prospecting workflows, ambiguous matches, multi-step chaining, and anything high-stakes
- Tradeoff: higher latency and higher model usage cost on the Anthropic side

### Strong fallback: Sonnet (faster)

Use Sonnet when you want speed for quick lookups, smaller jobs, or rapid iteration.

- Best for: quick searches, lightweight enrichment, and tight loops
- Tradeoff: may require more user guidance for complex multi-step workflows

In Claude Code, you can switch models via `/model`.


---

## 📦 Installation

### Cowork

Click the link below to install in one step:

[Install in Cowork](https://claude.ai/desktop/customize/plugins/new?marketplace=apolloio/apollo-mcp-plugin&plugin=apollo)

Then restart Cowork to ensure the MCP server starts correctly.

### Claude Code

#### 1. Add this plugin's marketplace

In Claude Code, run:

```
/plugin marketplace add apolloio/apollo-mcp-plugin
```

#### 2. Install the plugin

```
/plugin install apollo@apollo-plugin-marketplace
```

#### 3. Restart Claude Code

This ensures the MCP server starts correctly.

---

## 🔑 Authentication

The Apollo MCP Server supports **OAuth**:

1. After installation, run `/mcp` in Claude Code or `connect` to Apollo.io connector from settings
2. Select the **Apollo** server and click **Authenticate**
3. Complete the Apollo.io login in your browser
4. Done — all commands are now ready to use

---

## **⚠️** Apollo Credits and Safety

Some operations consume Apollo credits:

- People enrichment typically costs 1 credit per person
- Bulk enrichment consumes credits based on how many people are enriched

This plugin is designed to warn and request confirmation before credit-consuming actions by default.

Sequence safety:

- Adding contacts to a sequence can enroll them into an active sequence
- Depending on your sequence settings, outbound may start automatically
- Always verify your sequence name, sending account, and enrollment volume before confirming

---

## Quickstart Examples

Try these in Claude:

- “Enrich this lead: [https://www.linkedin.com/in/…”](https://www.linkedin.com/in/%E2%80%A6%E2%80%9D)
- “Find 25 VP Sales at SaaS companies (200-1000 employees) that raised funding in the last 6 months.”
- “Load the top 10 enriched leads into my sequence called ‘Q1 Enterprise Outbound’ and show me a preview before enrolling.”
- “Show me email and call performance by rep for this quarter, sorted by calls made.”

---

## 🙌 Credits

- **MCP Server** by [Apollo.io](https://docs.apollo.io/)
- **Plugin Specification** by [Anthropic](https://docs.anthropic.com/)

---

## License

MIT — see [LICENSE](LICENSE) for details.