# Apollo Agent Skills and MCP Plugins

Portable sales workflows for the [Apollo MCP server](https://docs.apollo.io/docs/apollo-mcp), packaged for Claude, Cursor, Codex, GitHub Copilot, and generic Agent Skills clients.

This repository is the canonical public source. Edit each workflow only in `skills/<skill>/SKILL.md`; package builds copy those canonical directories without client-specific rewrites.

## Public Skills

| Skill | What it does | Safety behavior |
|---|---|---|
| `onboarding` | Connect with OAuth, verify access, and choose a workflow | Read-only verification |
| `analytics` | Answer sales performance questions | Read-only |
| `enrich-lead` | Enrich a person and their company | Confirms each credit action |
| `prospect` | Turn an ICP into a ranked lead list | Confirms full enrichment volume and balance |
| `sequence-load` | Find and enroll contacts into a sequence | Previews and confirms credit use and enrollment |

The machine-readable source for versions, tool dependencies, safety behavior, and supported clients is [`catalog/skills.yaml`](catalog/skills.yaml).

## Install

### Consent-Based Installer

From a checkout:

```bash
pnpm install
pnpm exec apollo-skills setup
pnpm exec apollo-skills list
pnpm exec apollo-skills recommend "find decision makers matching my ICP"
pnpm exec apollo-skills add prospect --target generic
pnpm exec apollo-skills doctor
```

After publication, use `npx @apolloio/agent-skills` in place of `pnpm exec apollo-skills`.

`setup` installs only the onboarding skill. `setup` and `add` show the selected skills, destination, version, credit behavior, and write behavior before asking for confirmation. Use `--yes` only after reviewing that plan.

Supported targets are `generic`, `claude`, `cursor`, `codex`, and `copilot`.

### Claude Code and Cowork

```text
/plugin marketplace add apolloio/apollo-mcp-plugin
/plugin install apollo@apollo-plugin-marketplace
```

[Install in Cowork](https://claude.ai/desktop/customize/plugins/new?marketplace=apolloio/apollo-mcp-plugin&plugin=apollo)

### Cursor

Open the Cursor Plugin Marketplace, search for `Apollo`, and install the plugin.

## Connect Apollo MCP

Every package uses the same remote Streamable HTTP endpoint:

```text
https://mcp.apollo.io/mcp
```

Authentication uses OAuth 2.0. Apollo permissions, plan limits, and credits continue to apply. Follow the [Apollo MCP documentation](https://docs.apollo.io/docs/apollo-mcp) for client-specific connection controls.

## Recommend Contract

[`contracts/recommend-apollo-skills.schema.json`](contracts/recommend-apollo-skills.schema.json) defines the read-only `recommend_apollo_skills` contract. Contract version `1.0.0` returns recommendations and client-specific install commands; it never installs files.

## Maintain

```bash
pnpm install
pnpm check
pnpm build
```

- Keep public skill source under `skills/`.
- Update the catalog and focused eval cases with behavioral changes.
- Use stable Apollo server-level tool names, not client-qualified names.
- Keep generated output under `dist/`; it is not committed.
- Keep private, local, transport-experiment, raw evaluation, and credential-handling artifacts out of this repository.

## License

MIT. See [LICENSE](LICENSE).
