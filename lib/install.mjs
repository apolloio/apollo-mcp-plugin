import { createHash } from "node:crypto";
import { access, cp, mkdir, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { findSkill, repositoryRoot } from "./catalog.mjs";

export const targetDirectories = Object.freeze({
  generic: path.join(".agents", "skills"),
  claude: path.join(".claude", "skills"),
  cursor: path.join(".cursor", "skills"),
  codex: path.join(".agents", "skills"),
  copilot: path.join(".github", "skills"),
});

function assertInsideProject(projectRoot, candidate) {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(candidate);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Install destination must remain inside ${root}.`);
  }
  return resolved;
}

async function exists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function hashFile(candidate) {
  const contents = await readFile(candidate);
  return createHash("sha256").update(contents).digest("hex");
}

export function planInstallation({ catalog, skillIds, target, projectRoot }) {
  const relativeDirectory = targetDirectories[target];
  if (!relativeDirectory) {
    throw new Error(`Unknown target '${target}'. Choose: ${Object.keys(targetDirectories).join(", ")}.`);
  }
  if (skillIds.length === 0) throw new Error("Select at least one skill to install.");
  if (new Set(skillIds).size !== skillIds.length) {
    throw new Error("Each skill may only be selected once per installation.");
  }

  const skills = skillIds.map((skillId) => {
    const skill = findSkill(catalog, skillId);
    if (!skill || skill.visibility !== "public") throw new Error(`Unknown public skill '${skillId}'.`);
    if (!skill.supported_surfaces.includes(target)) {
      throw new Error(`Skill '${skillId}' does not support target '${target}'.`);
    }
    return skill;
  });

  const destinationRoot = assertInsideProject(projectRoot, path.join(projectRoot, relativeDirectory));
  return { destinationRoot, skills, target };
}

export async function installSkills({
  catalog,
  skillIds,
  target = "generic",
  projectRoot = process.cwd(),
  sourceRoot = repositoryRoot,
  overwrite = false,
}) {
  const plan = planInstallation({ catalog, skillIds, target, projectRoot });
  const installed = [];

  for (const skill of plan.skills) {
    const destination = assertInsideProject(projectRoot, path.join(plan.destinationRoot, skill.id));
    if ((await exists(destination)) && !overwrite) {
      throw new Error(`Skill '${skill.id}' already exists at ${destination}. Use --force to update it.`);
    }
    const source = path.resolve(sourceRoot, skill.path, "SKILL.md");
    if (!(await exists(source))) throw new Error(`Canonical skill '${skill.id}' is missing at ${source}.`);
  }

  await mkdir(plan.destinationRoot, { recursive: true });

  for (const skill of plan.skills) {
    const source = path.resolve(sourceRoot, skill.path);
    const destination = assertInsideProject(projectRoot, path.join(plan.destinationRoot, skill.id));
    const temporary = `${destination}.apollo-installing`;

    await rm(temporary, { recursive: true, force: true });
    await cp(source, temporary, { recursive: true, errorOnExist: true });
    if (await exists(destination)) await rm(destination, { recursive: true, force: true });
    await rename(temporary, destination);
    installed.push({ id: skill.id, version: skill.version, destination });
  }

  return installed;
}

export async function inspectInstallations({
  catalog,
  target = "generic",
  projectRoot = process.cwd(),
  sourceRoot = repositoryRoot,
}) {
  const relativeDirectory = targetDirectories[target];
  if (!relativeDirectory) throw new Error(`Unknown target '${target}'.`);
  const destinationRoot = assertInsideProject(projectRoot, path.join(projectRoot, relativeDirectory));
  const results = [];

  for (const skill of catalog.skills.filter((candidate) => candidate.visibility === "public")) {
    const sourceFile = path.resolve(sourceRoot, skill.path, "SKILL.md");
    const installedFile = path.join(destinationRoot, skill.id, "SKILL.md");
    if (!(await exists(installedFile))) {
      results.push({ id: skill.id, status: "not-installed", version: skill.version });
      continue;
    }
    const current = (await hashFile(sourceFile)) === (await hashFile(installedFile));
    results.push({
      id: skill.id,
      status: current ? "current" : "different",
      version: skill.version,
      path: installedFile,
    });
  }

  return results;
}
