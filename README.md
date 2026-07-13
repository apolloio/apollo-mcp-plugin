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

The skill directories are the canonical public workflow source. The checked-in `.claude-plugin/`, `.cursor-plugin/`, and `.mcp.json` manifests remain the unchanged `0.1.1` Claude and Cursor packaging from the base release. The `0.2.0` skills catalog does not update those manifests or claim that every listed platform can currently load this repository.

Platform status is tracked in `catalog/platform-support.json`:

| Platform | Status |
|---|---|
| Claude Code, Cowork, Cursor | Experimental |
| Codex, GitHub Copilot, Replit, Rovo Dev CLI, Perplexity Computer | Planned |

`experimental` means packaging exists but the complete clean-client lifecycle smoke test is still pending. `planned` is a roadmap signal, not a runtime or installation claim. The support catalog records discovery, destination, authentication, verification, update/removal, and rollback expectations for each platform. Actual tool availability, permissions, plan limits, and credit behavior come from the Apollo MCP server and the connected client.

## Safety Model

- Search and preview before requesting credit-consuming detail.
- Ask separately before revealing private contact data.
- Ask separately before creating Apollo contacts with deduplication.
- Treat sequence enrollment as a distinct live-outreach write.
- Treat sequence activation and direct sending as later, separate decisions.
- Stop when a required capability is unavailable; do not invent results or client commands.

## Validation

Run the dependency-free repository check with:

```text
node scripts/validate-skills.mjs
```

It validates the exact public inventory, catalog structure, frontmatter, encoding, leakage rules, declared tool references, platform statuses, and staged safety language.

## License

MIT. See `LICENSE`.
