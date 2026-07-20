import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "0.2.0";
const skillIds = ["onboarding", "analytics", "enrich-lead", "prospect", "sequence-load"];
const expectedTools = {
  onboarding: ["apollo_users_api_profile"],
  analytics: ["apollo_analytics_sync_report", "apollo_emailer_campaigns_search"],
  "enrich-lead": [
    "apollo_mixed_people_api_search",
    "apollo_people_match",
    "apollo_organizations_enrich",
    "apollo_contacts_create",
  ],
  prospect: [
    "apollo_mixed_people_api_search",
    "apollo_organizations_lookup",
    "apollo_mixed_companies_search",
    "apollo_users_api_profile",
    "apollo_people_bulk_match",
    "apollo_contacts_bulk_create",
  ],
  "sequence-load": [
    "apollo_emailer_campaigns_search",
    "apollo_email_accounts_index",
    "apollo_mixed_people_api_search",
    "apollo_users_api_profile",
    "apollo_people_bulk_match",
    "apollo_contacts_bulk_create",
    "apollo_emailer_campaigns_add_contact_ids",
    "apollo_emailer_campaigns_remove_or_stop_contact_ids",
  ],
};
const skillKeys = [
  "id",
  "path",
  "visibility",
  "summary",
  "required_tools",
  "credit_behavior",
  "write_behavior",
];
const errors = [];

function sameArray(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

async function readUtf8(relativePath) {
  const candidate = path.join(root, relativePath);
  const buffer = await readFile(candidate);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    errors.push(`${relativePath}: invalid UTF-8`);
    return "";
  }
  if (text.charCodeAt(0) === 0xfeff) errors.push(`${relativePath}: UTF-8 BOM is not allowed`);
  if (/[^\x00-\x7f]/.test(text)) errors.push(`${relativePath}: use ASCII punctuation and text`);
  if (/\u00c3|\u00c2|\u00e2\u0080|\ufffd/u.test(text)) errors.push(`${relativePath}: possible mojibake detected`);
  return text;
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    errors.push(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}

function parseFrontmatter(text, id) {
  const match = text.match(/^---\r?\n([^]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    errors.push(`${id}: missing frontmatter`);
    return null;
  }

  const lines = match[1].split(/\r?\n/);
  const fields = {};
  for (const line of lines) {
    const field = line.match(/^([a-z-]+):\s*(.+)$/);
    if (!field) {
      errors.push(`${id}: malformed frontmatter line '${line}'`);
      continue;
    }
    if (Object.hasOwn(fields, field[1])) errors.push(`${id}: duplicate frontmatter field '${field[1]}'`);
    let value = field[2];
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value);
      } catch (error) {
        errors.push(`${id}: invalid quoted frontmatter value (${error.message})`);
      }
    }
    fields[field[1]] = value;
  }

  if (!sameArray(Object.keys(fields), ["name", "description"])) {
    errors.push(`${id}: frontmatter must contain exactly name then description`);
  }
  if (fields.name !== id) errors.push(`${id}: frontmatter name must match the skill ID`);
  if (typeof fields.description !== "string" || fields.description.length < 1 || fields.description.length > 1024) {
    errors.push(`${id}: description must contain 1-1024 characters`);
  } else if (!/\bUse when\b/.test(fields.description)) {
    errors.push(`${id}: description must be trigger-rich and include 'Use when'`);
  }
  return fields;
}

async function validateManifests() {
  const manifests = {};
  for (const relativePath of [
    ".claude-plugin/marketplace.json",
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    ".mcp.json",
  ]) {
    const buffer = await readFile(path.join(root, relativePath));
    let text = "";
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      errors.push(`${relativePath}: invalid UTF-8`);
    }
    if (/\u00c3|\u00c2|\u00e2\u0080|\ufffd/u.test(text)) {
      errors.push(`${relativePath}: possible mojibake detected`);
    }
    const manifest = parseJson(text, relativePath);
    manifests[relativePath] = manifest;
    if (relativePath.endsWith("plugin.json") && manifest?.version !== version) {
      errors.push(`${relativePath}: version must match catalog version ${version}`);
    }
  }

  const repository = "https://github.com/apolloio/apollo-mcp-plugin";
  const marketplace = manifests[".claude-plugin/marketplace.json"];
  if (marketplace?.name !== "apollo-plugin-marketplace"
    || marketplace?.owner?.name !== "Apollo.io"
    || marketplace?.plugins?.length !== 1
    || marketplace.plugins[0]?.name !== "apollo"
    || marketplace.plugins[0]?.source !== "./") {
    errors.push(".claude-plugin/marketplace.json: Apollo marketplace identity or source changed");
  }
  for (const relativePath of [".claude-plugin/plugin.json", ".cursor-plugin/plugin.json"]) {
    const manifest = manifests[relativePath];
    if (manifest?.name !== "apollo" || manifest?.repository !== repository) {
      errors.push(`${relativePath}: Apollo plugin identity or repository changed`);
    }
  }
  if (manifests[".cursor-plugin/plugin.json"]?.mcpServers !== "./.mcp.json") {
    errors.push(".cursor-plugin/plugin.json: MCP manifest reference changed");
  }
  const apolloServer = manifests[".mcp.json"]?.mcpServers?.apollo;
  if (apolloServer?.type !== "http" || apolloServer?.url !== "https://mcp.apollo.io/mcp") {
    errors.push(".mcp.json: Apollo MCP transport or endpoint changed");
  }
}

async function validateInventory(catalog) {
  const entries = await readdir(path.join(root, "skills"), { withFileTypes: true });
  const directories = sorted(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  if (!sameArray(directories, sorted(skillIds))) {
    errors.push(`skills/: expected exactly ${skillIds.join(", ")}`);
  }

  for (const id of skillIds) {
    const files = await readdir(path.join(root, "skills", id), { withFileTypes: true });
    if (files.length !== 1 || !files[0].isFile() || files[0].name !== "SKILL.md") {
      errors.push(`skills/${id}: must contain only SKILL.md`);
    }
  }

  if (!catalog) return;
  if (!sameArray(Object.keys(catalog), ["catalog_version", "skills"])) {
    errors.push("catalog/skills.json: expected exactly catalog_version and skills fields");
  }
  if (catalog.catalog_version !== version) errors.push(`catalog/skills.json: catalog_version must be ${version}`);
  if (!Array.isArray(catalog.skills)) {
    errors.push("catalog/skills.json: skills must be an array");
    return;
  }
  if (!sameArray(catalog.skills.map((skill) => skill.id), skillIds)) {
    errors.push("catalog/skills.json: skill IDs and order must match the public inventory");
  }
}

function validateCatalogSkill(skill, id) {
  if (!skill || typeof skill !== "object") {
    errors.push(`${id}: catalog entry must be an object`);
    return;
  }
  if (!sameArray(Object.keys(skill), skillKeys)) errors.push(`${id}: catalog entry has incorrect fields or order`);
  if (skill.id !== id) errors.push(`${id}: catalog ID mismatch`);
  if (skill.path !== `skills/${id}`) errors.push(`${id}: catalog path mismatch`);
  if (skill.visibility !== "public") errors.push(`${id}: visibility must be public`);
  if (typeof skill.summary !== "string" || skill.summary.length < 40) errors.push(`${id}: summary is missing or too short`);
  if (!Array.isArray(skill.required_tools)) errors.push(`${id}: required_tools must be an array`);
  if (!sameArray(skill.required_tools, expectedTools[id])) errors.push(`${id}: required_tools changed from the reviewed release contract`);
  if (typeof skill.credit_behavior !== "string" || !skill.credit_behavior) errors.push(`${id}: credit_behavior is required`);
  if (typeof skill.write_behavior !== "string" || !skill.write_behavior) errors.push(`${id}: write_behavior is required`);
  for (const tool of skill.required_tools ?? []) {
    if (!/^apollo_[a-z0-9_]+$/.test(tool)) errors.push(`${id}: '${tool}' is not a platform-neutral Apollo tool name`);
  }
}

function validateToolReferences(text, skill) {
  const referenced = sorted(new Set(text.match(/\bapollo_[a-z0-9_]+\b/g) ?? []));
  const declared = sorted(skill.required_tools);
  if (!sameArray(referenced, declared)) {
    errors.push(`${skill.id}: referenced tools must exactly match required_tools`);
  }
  if (/\bmcp__/.test(text)) errors.push(`${skill.id}: harness-qualified tool reference detected`);
}

function validatePublicContent(text, label) {
  const forbidden = [
    [/"visibility"\s*:\s*"private"/i, "private visibility"],
    [/\bevals?\b/i, "evaluation artifact reference"],
    [/\$ARGUMENTS/, "client-specific argument placeholder"],
    [/\/apollo:/, "client-specific slash command"],
    [/\/plugin\b/, "client-specific plugin command"],
    [/\b(?:npm|pnpm|yarn|bun)\s+(?:add|install|exec|run|x)\b/i, "package command"],
    [/\b(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb)\b/i, "lockfile reference"],
  ];
  for (const [pattern, description] of forbidden) {
    if (label === "README.md" && description === "client-specific plugin command") continue;
    if (pattern.test(text)) errors.push(`${label}: ${description} detected`);
  }
  const emailPattern = new RegExp("\\b[A-Z0-9._%+-]+" + "@" + "[A-Z0-9.-]+\\.[A-Z]{2,}\\b", "i");
  if (emailPattern.test(text)) errors.push(`${label}: email-shaped PII detected`);
}

async function validateForbiddenArtifacts() {
  const forbiddenPaths = [
    "evals",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
  ];
  for (const relativePath of forbiddenPaths) {
    try {
      await access(path.join(root, relativePath));
      errors.push(`${relativePath}: excluded release artifact detected`);
    } catch {
      // Expected: excluded artifacts must not exist.
    }
  }
}

async function main() {
  const releasePaths = [
    "README.md",
    "catalog/skills.json",
    "scripts/validate-skills.mjs",
    ...skillIds.map((id) => `skills/${id}/SKILL.md`),
  ];
  const contents = new Map();
  for (const relativePath of releasePaths) contents.set(relativePath, await readUtf8(relativePath));

  const catalog = parseJson(contents.get("catalog/skills.json"), "catalog/skills.json");

  await validateInventory(catalog);
  await validateForbiddenArtifacts();
  await validateManifests();

  if (catalog?.skills) {
    for (let index = 0; index < skillIds.length; index += 1) {
      const id = skillIds[index];
      const skill = catalog.skills[index];
      validateCatalogSkill(skill, id);
      const skillText = contents.get(`skills/${id}/SKILL.md`);
      parseFrontmatter(skillText, id);
      if (skill) validateToolReferences(skillText, skill);
      validatePublicContent(skillText, `skills/${id}/SKILL.md`);
    }
  }

  validatePublicContent(contents.get("README.md"), "README.md");
  validatePublicContent(contents.get("catalog/skills.json"), "catalog/skills.json");

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);
  }
  console.log(`Validated ${skillIds.length} public Apollo skills at catalog version ${version}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
