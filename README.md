# Apollo Public Skills v0.2.0

This repository is the canonical public source for five Apollo MCP workflow skills. The maintained source for each workflow is `skills/<id>/SKILL.md`; `catalog/skills.json` records its public metadata and tool dependencies.

## Public Inventory

| Skill | Purpose | Safety boundary |
|---|---|---|
| `onboarding` | Verify an Apollo connection and choose a workflow | Read-only verification |
| `analytics` | Answer sales performance questions | Read-only reporting |
| `enrich-lead` | Resolve and enrich one lead | Separate credit, private-data, and contact-write approvals |
| `prospect` | Turn an ICP into a ranked shortlist | Search first; separate enrichment, reveal, and write approvals |
| `sequence-load` | Prepare and enroll selected contacts | Separate credit, reveal, contact-write, enrollment, activation, and send approvals |

The skills disclose only the next decision the user needs to make. Read-only discovery and previews come before credit use, private-data reveal, or any write.

## Packaging Scope

The skill directories are the canonical public workflow source. The existing Claude and Cursor plugin manifests advance to `0.2.0` so clients that use manifest versions can detect this skill release. This does not claim that every listed platform can load this repository.

Platform status is tracked in `catalog/platform-support.json`:

| Platform | Apollo MCP connection | Public skill delivery from this release |
|---|---|---|
| ChatGPT | First-party connector | Planned; ChatGPT supports skill upload, but this release has no verified adapter |
| Claude connector | First-party connector | Guidance only; connector installation does not prove skill discovery |
| Claude Code | Documented standalone connection | Experimental Claude plugin packaging |
| Claude Cowork | First-party coding plugin | Experimental Claude marketplace packaging |
| Cursor | First-party connector | Experimental Cursor plugin packaging |
| Codex | First-party coding plugin | Planned; no verified adapter in this release |
| Replit | First-party connector | Planned; no verified adapter in this release |
| Perplexity connector | First-party connector | Guidance only; skill delivery is separate |
| Perplexity Computer Skills | Separate skill surface | Planned; no verified upload bundle in this release |
| VS Code with GitHub Copilot | Documented standalone connection | Planned; no verified adapter in this release |
| Claude Desktop | Documented standalone connection | Guidance only; no verified adapter in this release |
| Antigravity | Documented standalone connection | Planned; no verified adapter in this release |
| Other MCP-compatible clients | Generic remote MCP fallback | Guidance only; no portable destination can be assumed |
| Rovo Dev CLI | Research only; not an Apollo support claim | Research only; not an Apollo support claim |

MCP connection availability and skill delivery are independent. A store, connector, plugin, or standalone MCP installation must not be treated as proof that these five skills are installed or discoverable. `experimental` means packaging exists but the complete clean-client lifecycle smoke test is still pending. `planned` and `guidance only` do not claim runtime installation support. The catalog records authentication and connection evidence separately from skill discovery, destination, verification, update/removal, and rollback expectations. Actual tool availability, permissions, plan limits, and credit behavior come from the Apollo MCP server and the connected client.

## Safety Model

- Search and preview before requesting credit-consuming detail.
- Ask separately before revealing private contact data.
- Ask separately before creating Apollo contacts; do not promise bulk deduplication unless the active tool contract does.
- Treat sequence enrollment as a distinct live-outreach write.
- Treat sequence activation and direct sending as later, separate decisions.
- Stop when a required capability is unavailable; do not invent results or client commands.

## Runtime Release Gate

Publish `v0.2.0` only after every tool listed in `catalog/skills.json` and every parameter used by a `SKILL.md` workflow is exposed by the production MCP surface, and after the Leadgenie implementation passes its required checks. In particular, `prospect` depends on the free `apollo_organizations_organization_lookup` contract. Phone reveal remains optional and must run only when the active tool descriptions expose a complete reveal-and-poll contract. If a capability is unavailable, the skill must report the limitation; it must not invent a replacement or fall back to the credit-charging `apollo_mixed_companies_search` tool.

## Validation

Run the dependency-free repository check with:

```text
node scripts/validate-skills.mjs
```

It validates public inventory, catalog structure, frontmatter, encoding, leakage rules, declared tool references, platform status shape, and plugin release versions.

## License

MIT. See `LICENSE`.
