# Apollo Plugin for Claude Code and Cowork

Prospect, enrich leads, and load outreach sequences with [Apollo.io](https://www.apollo.io/) — powered by the Apollo MCP Server with **one-click integration**.

---

## 🔌 One-Click MCP Server Integration

This plugin **automatically configures the Apollo MCP Server** when installed. No manual server setup, no config files to edit - just install the plugin and authenticate with your Apollo Account.

---

## ✅ Powerful Slash Commands

This plugin ships with a set of helpful commands:

| Command | What it does |
|---|---|
| `/apollo:enrich-lead` | Get a full contact profile (email, phone, title, company) from a name, company, or LinkedIn URL |
| `/apollo:prospect` | Describe your ideal customer and get a table of enriched decision-maker leads |
| `/apollo:sequence-load` | Find leads matching criteria and bulk-add them to an Apollo outreach sequence |

### `/apollo:enrich-lead`

Drop in a name, company, LinkedIn URL, or email — get back a complete contact card with email, phone, title, location, company details, and suggested next actions.

### `/apollo:prospect`

Describe your ICP in plain English. The pipeline searches for matching companies, enriches firmographic data, finds decision makers, reveals contact info, and returns a ranked lead table.

### `/apollo:sequence-load`

Find contacts matching your targeting criteria, enrich them, and bulk-add them to an existing Apollo sequence. Handles deduplication and enrollment automatically.

---

## 📦 Installation (Claude Code / Cowork)

### 1. Add this plugin's marketplace

In Claude Code or Cowork, run:

```
/plugin marketplace add apolloio/apollo-mcp-plugin
```

### 2. Install the plugin

```
/plugin install apollo@apollo-plugin-marketplace
```

### 3. Restart Claude Code / Cowork

This ensures the MCP server starts correctly.

---

## 🔑 Authentication

The Apollo MCP Server supports **OAuth**:

1. After installation, run `/mcp` in Claude Code or Cowork
2. Select the **Apollo** server and click **Authenticate**
3. Complete the Apollo.io login in your browser
4. Done — all commands are now ready to use

---

## ⚠️ Apollo Credits

Some operations consume [Apollo credits](https://docs.apollo.io/):

- **People enrichment** (used by all three commands) costs 1 credit per person
- The plugin will always warn you before consuming credits

---

## 🙌 Credits

- **MCP Server** by [Apollo.io](https://docs.apollo.io/)
- **Plugin Specification** by [Anthropic](https://docs.anthropic.com/)

---

## License

MIT — see [LICENSE](LICENSE) for details.
