import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillIds = ["onboarding", "analytics", "enrich-lead", "prospect", "sequence-load"];
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

function sameMembers(actual, expected) {
  return sameArray(sorted(actual), sorted(expected));
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
  if (relativePath !== "README.md" && /[^\x00-\x7f]/.test(text)) {
    errors.push(`${relativePath}: use ASCII punctuation and text`);
  }
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

  const frontmatterKeys = ["name", "description"];
  if (!sameMembers(Object.keys(fields), frontmatterKeys)) {
    errors.push(`${id}: frontmatter must contain exactly name and description`);
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
    "server.json",
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
    if (manifest?.version !== manifests["server.json"]?.version) {
      errors.push(`${relativePath}: version must match server.json`);
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
  if (!sameMembers(Object.keys(catalog), ["catalog_version", "skills"])) {
    errors.push("catalog/skills.json: expected exactly catalog_version and skills fields");
  }
  if (typeof catalog.catalog_version !== "string" || !/^\d+\.\d+\.\d+$/.test(catalog.catalog_version)) {
    errors.push("catalog/skills.json: catalog_version must be a semantic version");
  }
  if (!Array.isArray(catalog.skills)) {
    errors.push("catalog/skills.json: skills must be an array");
    return;
  }
  const catalogIds = catalog.skills.map((skill) => skill?.id);
  if (catalogIds.some((id) => typeof id !== "string") || !sameMembers(catalogIds, skillIds)) {
    errors.push("catalog/skills.json: skill IDs must match the public inventory");
  }
}

function validateCatalogSkill(skill, id) {
  if (!skill || typeof skill !== "object") {
    errors.push(`${id}: catalog entry must be an object`);
    return;
  }
  if (!sameMembers(Object.keys(skill), skillKeys)) errors.push(`${id}: catalog entry has incorrect fields`);
  if (skill.id !== id) errors.push(`${id}: catalog ID mismatch`);
  if (skill.path !== `skills/${id}`) errors.push(`${id}: catalog path mismatch`);
  if (skill.visibility !== "public") errors.push(`${id}: visibility must be public`);
  if (typeof skill.summary !== "string" || skill.summary.length < 40) errors.push(`${id}: summary is missing or too short`);
  if (!Array.isArray(skill.required_tools)) errors.push(`${id}: required_tools must be an array`);
  if (Array.isArray(skill.required_tools) && new Set(skill.required_tools).size !== skill.required_tools.length) {
    errors.push(`${id}: required_tools contains duplicates`);
  }
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

function validateWorkflowSafety(text, id) {
  if (!["enrich-lead", "prospect", "sequence-load"].includes(id)) return;

  for (const phrase of [
    "include_waterfall_capability: true",
    "apollo_webhook_result_show",
    "top-level request ID",
    "create or update",
    "overwritten",
    "cannot be undone",
  ]) {
    if (!text.includes(phrase)) errors.push(`${id}: missing reviewed safety contract '${phrase}'`);
  }
  if (/\brun_dedupe\b/.test(text)) errors.push(`${id}: unsupported run_dedupe parameter detected`);

  if (["prospect", "sequence-load"].includes(id)) {
    for (const phrase of [
      "at most 10",
      "do not loop `apollo_people_bulk_match`",
      "You have [X] credits remaining",
    ]) {
      if (!text.includes(phrase)) errors.push(`${id}: missing bulk-enrichment contract '${phrase}'`);
    }
  }

  if (id === "sequence-load") {
    for (const phrase of [
      "only for `remove` or `stop`",
      "permanently removes",
      "pause or finish",
      "apollo_contacts_search",
      "stop_reason",
      "never invent it",
    ]) {
      if (!text.includes(phrase)) errors.push(`${id}: missing sequence membership contract '${phrase}'`);
    }
  }
}

function isAsciiLetter(character) {
  const code = character.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isAsciiDigit(character) {
  const code = character.charCodeAt(0);
  return code >= 48 && code <= 57;
}

function isEmailLocalCharacter(character) {
  return isAsciiLetter(character)
    || isAsciiDigit(character)
    || "._%+-".includes(character);
}

function isEmailDomainCharacter(character) {
  return isAsciiLetter(character)
    || isAsciiDigit(character)
    || character === "."
    || character === "-";
}

function containsEmailShapedText(text) {
  const maxLocalLength = 64;
  const maxDomainLength = 253;

  for (let at = text.indexOf("@"); at !== -1; at = text.indexOf("@", at + 1)) {
    let start = at;
    while (start > 0 && at - start < maxLocalLength && isEmailLocalCharacter(text[start - 1])) {
      start -= 1;
    }
    if (start === at || (start > 0 && isEmailLocalCharacter(text[start - 1]))) continue;

    let end = at + 1;
    while (end < text.length && end - at - 1 < maxDomainLength && isEmailDomainCharacter(text[end])) {
      end += 1;
    }
    if (end === at + 1 || (end < text.length && isEmailDomainCharacter(text[end]))) continue;

    const labels = text.slice(at + 1, end).split(".");
    if (labels.length < 2) continue;
    if (labels.some((label) => label.length < 1
      || label.length > 63
      || !isAsciiLetter(label[0]) && !isAsciiDigit(label[0])
      || !isAsciiLetter(label.at(-1)) && !isAsciiDigit(label.at(-1)))) continue;

    const topLevelDomain = labels.at(-1);
    if (topLevelDomain.length >= 2 && [...topLevelDomain].every(isAsciiLetter)) return true;
  }
  return false;
}

function validatePublicContent(text, label) {
  const forbidden = [
    [/"visibility"\s*:\s*"private"/i, "private visibility"],
    [/\bevals?\b/i, "evaluation artifact reference"],
    [/\b(?:npm|pnpm|yarn|bun)\s+(?:add|install|exec|run|x)\b/i, "package command"],
    [/\b(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb)\b/i, "lockfile reference"],
  ];
  if (label.startsWith("skills/")) {
    forbidden.push(
      [/\$ARGUMENTS/, "client-specific argument placeholder"],
      [/\/apollo:/, "client-specific slash command"],
      [/\/plugin\b/, "client-specific plugin command"],
    );
  }
  for (const [pattern, description] of forbidden) {
    if (pattern.test(text)) errors.push(`${label}: ${description} detected`);
  }
  if (containsEmailShapedText(text)) errors.push(`${label}: email-shaped PII detected`);
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

  if (Array.isArray(catalog?.skills)) {
    const catalogById = new Map(catalog.skills.map((skill) => [skill?.id, skill]));
    for (const id of skillIds) {
      const skill = catalogById.get(id);
      validateCatalogSkill(skill, id);
      const skillText = contents.get(`skills/${id}/SKILL.md`);
      parseFrontmatter(skillText, id);
      if (skill) validateToolReferences(skillText, skill);
      validateWorkflowSafety(skillText, id);
      validatePublicContent(skillText, `skills/${id}/SKILL.md`);
    }
  }

  validatePublicContent(contents.get("README.md"), "README.md");
  validatePublicContent(contents.get("catalog/skills.json"), "catalog/skills.json");

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);
  }
  console.log(`Validated ${skillIds.length} public Apollo skills at catalog version ${catalog.catalog_version}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
