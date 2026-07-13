import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { loadCatalog, repositoryRoot } from "../lib/catalog.mjs";
import { targetDirectories } from "../lib/install.mjs";

const allowedFrontmatter = new Set(["name", "description", "license", "metadata", "allowed-tools"]);
const forbiddenSkillPatterns = [
  [/mcp__/, "harness-qualified MCP tool name"],
  [/\$ARGUMENTS/, "harness-specific argument placeholder"],
  [/\/apollo:/, "Claude-specific slash command"],
];
const forbiddenOnboardingPatterns = [
  [/replit/i, "client-specific hosted-development guidance"],
  [/app[- ]?builder/i, "app-builder guidance"],
  [/api[-_ ]?key/i, "API key guidance"],
  [/\bsecrets?\b/i, "secrets-store guidance"],
];

function fail(errors) {
  if (errors.length === 0) return;
  throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);
}

function parseSkill(contents, skillId, errors) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    errors.push(`${skillId}: missing YAML frontmatter`);
    return null;
  }
  let frontmatter;
  try {
    frontmatter = parse(match[1]);
  } catch (error) {
    errors.push(`${skillId}: invalid YAML frontmatter (${error.message})`);
    return null;
  }
  for (const key of Object.keys(frontmatter)) {
    if (!allowedFrontmatter.has(key)) errors.push(`${skillId}: non-portable frontmatter field '${key}'`);
  }
  return frontmatter;
}

async function validateManifestVersion(candidate, expectedVersion, errors) {
  const manifest = JSON.parse(await readFile(candidate, "utf8"));
  if (manifest.version !== expectedVersion) {
    errors.push(`${path.relative(repositoryRoot, candidate)}: version ${manifest.version} does not match ${expectedVersion}`);
  }
}

async function listFiles(candidate) {
  const entries = await readdir(candidate, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(candidate, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

async function main() {
  const catalog = await loadCatalog();
  const errors = [];
  const expectedSurfaces = Object.keys(targetDirectories);
  const toolContract = JSON.parse(
    await readFile(path.join(repositoryRoot, "contracts", "apollo-mcp-tools.json"), "utf8"),
  );
  const availableTools = new Set(toolContract.tools);

  if (catalog.package_version !== "0.3.0") errors.push("catalog package_version must be 0.3.0");
  if (JSON.stringify(catalog.surfaces) !== JSON.stringify(expectedSurfaces)) {
    errors.push(`catalog surfaces must be: ${expectedSurfaces.join(", ")}`);
  }

  const skillDirectories = (await readdir(path.join(repositoryRoot, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const catalogIds = catalog.skills.map((skill) => skill.id).sort();
  if (JSON.stringify(skillDirectories) !== JSON.stringify(catalogIds)) {
    errors.push(`catalog skills (${catalogIds.join(", ")}) do not match skills/ (${skillDirectories.join(", ")})`);
  }

  for (const skill of catalog.skills) {
    if (skill.visibility !== "public") errors.push(`${skill.id}: public catalog may only contain public skills`);
    if (JSON.stringify(skill.supported_surfaces) !== JSON.stringify(expectedSurfaces)) {
      errors.push(`${skill.id}: supported surfaces must match the catalog surfaces`);
    }
    for (const tool of skill.required_tools) {
      if (!availableTools.has(tool)) errors.push(`${skill.id}: tool ${tool} is absent from the MCP contract snapshot`);
    }

    const skillPath = path.join(repositoryRoot, skill.path, "SKILL.md");
    const contents = await readFile(skillPath, "utf8");
    const frontmatter = parseSkill(contents, skill.id, errors);
    if (frontmatter) {
      if (frontmatter.name !== skill.id) errors.push(`${skill.id}: frontmatter name mismatch`);
      if (frontmatter.metadata?.version !== skill.version) errors.push(`${skill.id}: version mismatch`);
      if (frontmatter.license !== "MIT") errors.push(`${skill.id}: license must be MIT`);
    }
    for (const [pattern, label] of forbiddenSkillPatterns) {
      if (pattern.test(contents)) errors.push(`${skill.id}: contains ${label}`);
    }
    if (skill.id === "onboarding") {
      for (const [pattern, label] of forbiddenOnboardingPatterns) {
        if (pattern.test(contents)) errors.push(`onboarding: contains ${label}`);
      }
    }

    const referencedTools = [...new Set(contents.match(/\bapollo_[a-z0-9_]+\b/g) ?? [])].sort();
    const declaredTools = [...skill.required_tools].sort();
    for (const tool of referencedTools.filter((tool) => !declaredTools.includes(tool))) {
      errors.push(`${skill.id}: references undeclared tool ${tool}`);
    }
    for (const tool of declaredTools.filter((tool) => !referencedTools.includes(tool))) {
      errors.push(`${skill.id}: declares unused tool ${tool}`);
    }

    const evalPath = path.join(repositoryRoot, "evals", skill.id, "cases.json");
    const evals = JSON.parse(await readFile(evalPath, "utf8"));
    if (!Array.isArray(evals.cases) || evals.cases.length < 2) errors.push(`${skill.id}: requires at least two eval cases`);
    for (const testCase of evals.cases ?? []) {
      if (testCase.expected_skill !== skill.id) errors.push(`${skill.id}: eval '${testCase.name}' has wrong expected skill`);
      for (const tool of testCase.expected_tools ?? []) {
        if (!declaredTools.includes(tool)) errors.push(`${skill.id}: eval '${testCase.name}' expects undeclared tool ${tool}`);
      }
    }
  }

  await validateManifestVersion(path.join(repositoryRoot, ".claude-plugin", "plugin.json"), catalog.package_version, errors);
  await validateManifestVersion(path.join(repositoryRoot, ".cursor-plugin", "plugin.json"), catalog.package_version, errors);
  await validateManifestVersion(path.join(repositoryRoot, "packages", "codex", "apollo", ".codex-plugin", "plugin.json"), catalog.package_version, errors);
  await validateManifestVersion(path.join(repositoryRoot, "packages", "copilot", "apollo", "plugin.json"), catalog.package_version, errors);

  const publicFiles = [
    ...(await listFiles(path.join(repositoryRoot, "skills"))),
    path.join(repositoryRoot, "catalog", "skills.yaml"),
    ...(await listFiles(path.join(repositoryRoot, "packages"))),
  ];
  for (const candidate of publicFiles) {
    const contents = await readFile(candidate, "utf8");
    if (/replit-onboarding|"visibility"\s*:\s*"private"/i.test(contents)) {
      errors.push(`${path.relative(repositoryRoot, candidate)}: excluded skill material detected`);
    }
  }

  const recommendationContract = JSON.parse(
    await readFile(path.join(repositoryRoot, "contracts", "recommend-apollo-skills.schema.json"), "utf8"),
  );
  if (recommendationContract.properties?.contract_version?.const !== "1.0.0") {
    errors.push("recommend_apollo_skills contract_version must be 1.0.0");
  }
  if (!recommendationContract.required?.includes("contract_version")) {
    errors.push("recommend_apollo_skills must require contract_version");
  }

  fail(errors);
  console.log(`Validated ${catalog.skills.length} portable skills, ${expectedSurfaces.length} surfaces, and recommendation contract 1.0.0.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
