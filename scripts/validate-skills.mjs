import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "0.2.0";
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
const expectedTools = {
  onboarding: ["apollo_users_api_profile"],
  analytics: ["apollo_analytics_sync_report", "apollo_emailer_campaigns_search"],
  "enrich-lead": [
    "apollo_mixed_people_api_search",
    "apollo_people_match",
    "apollo_organizations_enrich",
    "apollo_webhook_result_show",
    "apollo_contacts_create",
  ],
  prospect: [
    "apollo_mixed_people_api_search",
    "apollo_organizations_organization_lookup",
    "apollo_users_api_profile",
    "apollo_people_bulk_match",
    "apollo_webhook_result_show",
    "apollo_contacts_bulk_create",
  ],
  "sequence-load": [
    "apollo_emailer_campaigns_search",
    "apollo_email_accounts_index",
    "apollo_mixed_people_api_search",
    "apollo_users_api_profile",
    "apollo_people_bulk_match",
    "apollo_webhook_result_show",
    "apollo_contacts_bulk_create",
    "apollo_emailer_campaigns_add_contact_ids",
    "apollo_emailer_campaigns_remove_or_stop_contact_ids",
  ],
};
const expectedCreditBehavior = {
  onboarding: "none",
  analytics: "none",
  "enrich-lead": "confirmation-before-each-credit-action",
  prospect: "confirmation-with-count-before-credit-action",
  "sequence-load": "confirmation-with-count-before-credit-action",
};
const expectedWriteBehavior = {
  onboarding: "read-only",
  analytics: "read-only",
  "enrich-lead": "separate-confirmation-before-contact-write",
  prospect: "separate-confirmation-before-contact-write",
  "sequence-load": "separate-confirmations-for-contact-write-enrollment-activation-and-send",
};
const expectedPlatforms = {
  chatgpt: ["first_party_connector", "guidance_only"],
  claude_connector: ["first_party_connector", "guidance_only"],
  claude_code: ["standalone_documented", "experimental"],
  claude_cowork: ["first_party_plugin", "experimental"],
  cursor: ["standalone_documented", "experimental"],
  codex: ["first_party_plugin", "planned"],
  replit: ["first_party_connector", "planned"],
  perplexity_connector: ["first_party_connector", "guidance_only"],
  perplexity_computer: ["separate_skill_surface", "planned"],
  copilot: ["standalone_documented", "planned"],
  claude_desktop: ["standalone_documented", "guidance_only"],
  antigravity: ["standalone_documented", "planned"],
  generic: ["generic_compatible", "guidance_only"],
  rovo_dev: ["research_only", "research_only"],
};
const expectedMcpConnectionStatuses = [
  "first_party_connector",
  "first_party_plugin",
  "standalone_documented",
  "generic_compatible",
  "separate_skill_surface",
  "research_only",
];
const expectedSkillDeliveryStatuses = ["experimental", "planned", "guidance_only", "research_only"];
const platformKeys = ["label", "mcp_connection", "skill_delivery"];
const mcpConnectionKeys = [
  "status",
  "availability",
  "authentication",
  "official_documentation_url",
];
const skillDeliveryKeys = [
  "status",
  "discovery",
  "installation",
  "destination_scope",
  "verification",
  "update_removal",
  "rollback",
  "official_documentation_url",
];
const manifestBlobs = {
  ".claude-plugin/marketplace.json": "ad60c72cc099c37c69b68eb93afb2fcff2db1ddd",
  ".claude-plugin/plugin.json": "664460600a658ff0762b8f4f675af1348feec33d",
  ".cursor-plugin/plugin.json": "b39272388a73f54f995b3a89f7a1ecc2e0c8f0f1",
  ".mcp.json": "40be81c3a786f271c1970cd9d41caa2c684a9365",
};
const stagedSafety = {
  "enrich-lead": [
    "Enriching [name] will use 1 credit (no charge if not found). Do you want to proceed?",
    "Enriching [domain] will consume 1 credit (no charge if not found). Do you want to proceed?",
    "This will reveal private contact data for [N] selected people. Do you want me to reveal it now?",
    "Enriching [name] will use 1 credit, plus additional credits if the phone number is successfully revealed (no charge if the number isn't found). Do you want to proceed?",
    "This will create or update [N] Apollo contact records with deduplication enabled. Do you want me to make that contact write now?",
  ],
  prospect: [
    "This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?",
    "This will reveal private contact data for [N] selected people. Do you want me to reveal it now?",
    "This will enrich [N] people and use up to [N] credits (1 credit per match, no charge for unmatched), plus additional credits for each phone number successfully revealed (no charge if a number isn't found). Do you want to proceed?",
    "This will create or update [N] Apollo contact records with deduplication enabled. Do you want me to make that contact write now?",
  ],
  "sequence-load": [
    "This will enrich [N] people and consume up to [N] credits (1 credit per match, no charge for unmatched). Do you want to proceed?",
    "This will reveal private contact data for [N] selected people. Do you want me to reveal it now?",
    "This will enrich [N] people and use up to [N] credits (1 credit per match, no charge for unmatched), plus additional credits for each phone number successfully revealed (no charge if a number isn't found). Do you want to proceed?",
    "This will create or update [N] Apollo contact records with deduplication enabled. Do you want me to make that contact write now?",
    "This will enroll [N] contacts in [Sequence Name] using [Sending Account] with status paused. Do you want me to enroll them now?",
    "This will activate [Sequence Name] and may begin configured outbound sending. Do you want me to activate it now?",
    "This will send a real message to [Recipient] from [Sending Account]. Do you want me to send it now?",
  ],
};
const phonePollingProducer = {
  "enrich-lead": "apollo_people_match",
  prospect: "apollo_people_bulk_match",
  "sequence-load": "apollo_people_bulk_match",
};
const errors = [];

function sameArray(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function relative(candidate) {
  return path.relative(root, candidate).replaceAll(path.sep, "/");
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
  if (typeof fields.description !== "string" || !/\bUse when\b/.test(fields.description)) {
    errors.push(`${id}: description must be trigger-rich and include 'Use when'`);
  }
  return fields;
}

function gitBlobId(buffer) {
  const canonical = Buffer.from(buffer.toString("utf8").replaceAll("\r\n", "\n"));
  const header = Buffer.from(`blob ${canonical.length}\0`);
  return createHash("sha1").update(header).update(canonical).digest("hex");
}

async function validateManifests() {
  for (const [relativePath, expectedHash] of Object.entries(manifestBlobs)) {
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
    parseJson(text, relativePath);
    const actualHash = gitBlobId(buffer);
    if (actualHash !== expectedHash) {
      errors.push(`${relativePath}: must remain content-identical to the 0.1.1 base manifest`);
    }
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
  if (!sameArray(skill.required_tools, expectedTools[id])) errors.push(`${id}: required_tools do not match the release contract`);
  if (skill.credit_behavior !== expectedCreditBehavior[id]) errors.push(`${id}: credit_behavior mismatch`);
  if (skill.write_behavior !== expectedWriteBehavior[id]) errors.push(`${id}: write_behavior mismatch`);
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

function validateSafety(text, id) {
  const requiredStages = stagedSafety[id] ?? [];
  let previous = -1;
  for (const phrase of requiredStages) {
    const index = text.indexOf(phrase);
    if (index === -1) errors.push(`${id}: missing an exact staged safety confirmation`);
    if (index !== -1 && index <= previous) errors.push(`${id}: safety confirmation is out of staged order`);
    if (index !== -1) previous = index;
  }

  const producer = phonePollingProducer[id];
  if (producer) {
    for (const phrase of [
      `After the confirmed \`${producer}\` call`,
      "top-level `request_id`",
      "call `apollo_webhook_result_show`",
      "up to about five attempts",
      "Do not claim that",
    ]) {
      if (!text.includes(phrase)) errors.push(`${id}: incomplete asynchronous phone polling workflow`);
    }
  }
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
    "catalog/platform-support.json",
    "scripts/validate-skills.mjs",
    ...skillIds.map((id) => `skills/${id}/SKILL.md`),
  ];
  const contents = new Map();
  for (const relativePath of releasePaths) contents.set(relativePath, await readUtf8(relativePath));

  const catalog = parseJson(contents.get("catalog/skills.json"), "catalog/skills.json");
  const platformCatalog = parseJson(
    contents.get("catalog/platform-support.json"),
    "catalog/platform-support.json",
  );

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
      validateSafety(skillText, id);
      validatePublicContent(skillText, `skills/${id}/SKILL.md`);
    }
  }

  validatePublicContent(contents.get("README.md"), "README.md");
  validatePublicContent(contents.get("catalog/skills.json"), "catalog/skills.json");
  validatePublicContent(contents.get("catalog/platform-support.json"), "catalog/platform-support.json");

  if (platformCatalog) {
    if (/private[- ]overlay|private skills?/i.test(contents.get("catalog/platform-support.json"))) {
      errors.push("catalog/platform-support.json: private implementation details are not allowed");
    }
    if (!sameArray(Object.keys(platformCatalog), ["catalog_version", "status_definitions", "platforms"])) {
      errors.push("catalog/platform-support.json: unexpected root fields");
    }
    if (platformCatalog.catalog_version !== version) {
      errors.push(`catalog/platform-support.json: catalog_version must be ${version}`);
    }
    if (!sameArray(Object.keys(platformCatalog.status_definitions ?? {}), ["mcp_connection", "skill_delivery"])) {
      errors.push("catalog/platform-support.json: status definitions must separate MCP connection and skill delivery");
    }
    if (!sameArray(
      Object.keys(platformCatalog.status_definitions?.mcp_connection ?? {}),
      expectedMcpConnectionStatuses,
    )) {
      errors.push("catalog/platform-support.json: MCP connection status definitions are incomplete");
    }
    if (!sameArray(
      Object.keys(platformCatalog.status_definitions?.skill_delivery ?? {}),
      expectedSkillDeliveryStatuses,
    )) {
      errors.push("catalog/platform-support.json: skill delivery status definitions are incomplete");
    }
    if (!sameArray(Object.keys(platformCatalog.platforms ?? {}), Object.keys(expectedPlatforms))) {
      errors.push("catalog/platform-support.json: platform inventory or order mismatch");
    }
    for (const [platform, [connectionStatus, deliveryStatus]] of Object.entries(expectedPlatforms)) {
      const entry = platformCatalog.platforms?.[platform];
      if (!entry || !sameArray(Object.keys(entry), platformKeys)) {
        errors.push(`catalog/platform-support.json: ${platform} fields are incomplete`);
        continue;
      }
      if (!sameArray(Object.keys(entry.mcp_connection ?? {}), mcpConnectionKeys)) {
        errors.push(`catalog/platform-support.json: ${platform} MCP connection fields are incomplete`);
      }
      if (!sameArray(Object.keys(entry.skill_delivery ?? {}), skillDeliveryKeys)) {
        errors.push(`catalog/platform-support.json: ${platform} skill delivery fields are incomplete`);
      }
      if (entry.mcp_connection?.status !== connectionStatus) {
        errors.push(`catalog/platform-support.json: ${platform} MCP connection must be ${connectionStatus}`);
      }
      if (entry.skill_delivery?.status !== deliveryStatus) {
        errors.push(`catalog/platform-support.json: ${platform} skill delivery must be ${deliveryStatus}`);
      }
      for (const documentationUrl of [
        entry.mcp_connection?.official_documentation_url,
        entry.skill_delivery?.official_documentation_url,
      ]) {
        if (typeof documentationUrl !== "string" || !documentationUrl.startsWith("https://")) {
          errors.push(`catalog/platform-support.json: ${platform} must use HTTPS documentation URLs`);
        }
      }
      if (["planned", "guidance_only", "research_only"].includes(deliveryStatus)
        && entry.skill_delivery?.installation !== "Not available from this release.") {
        errors.push(`catalog/platform-support.json: ${platform} must not provide actionable installation`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);
  }
  console.log(`Validated ${skillIds.length} public Apollo skills at catalog version ${version}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
