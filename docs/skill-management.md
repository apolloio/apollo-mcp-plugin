# Skill and MCP Management

Apollo MCP tools and Apollo skills have separate delivery lifecycles:

- The Apollo MCP server exposes authenticated capabilities at runtime.
- A client discovers and activates installed `SKILL.md` instructions.
- Package manifests connect a client to both layers.

## Source of Truth

`skills/<skill>/SKILL.md` is the only editable source for each public skill. Generated packages copy those directories exactly.

`catalog/skills.yaml` records ownership, versions, public visibility, required Apollo tools, credit and write behavior, and supported clients.

## Discovery and Installation

The `apollo-skills` CLI provides:

- `setup`: install only canonical onboarding
- `list`: inspect the public catalog
- `recommend`: return versioned, read-only workflow recommendations
- `add`: install explicitly selected skills
- `doctor`: compare installed files with canonical source

No command silently installs a skill. `setup` and `add` require interactive confirmation or an explicit `--yes` after displaying the plan.

## Release Gates

Every release must:

1. Validate portable frontmatter and catalog completeness.
2. Reject client-qualified tool names and client-only argument syntax.
3. Verify every referenced Apollo tool is declared in the catalog.
4. Run focused cases for each skill, including credit and write safeguards.
5. Build Claude, Cursor, Codex, Copilot, and generic packages from the same skill sources.
6. Confirm excluded skills and local-only artifacts are absent from source and generated output.
