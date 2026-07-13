import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { repositoryRoot } from "../lib/catalog.mjs";
import { buildPackages } from "../scripts/build-packages.mjs";

async function readTree(candidate) {
  const entries = await readdir(candidate, { withFileTypes: true });
  const contents = [];
  for (const entry of entries) {
    const entryPath = path.join(candidate, entry.name);
    if (entry.isDirectory()) contents.push(...(await readTree(entryPath)));
    else if (entry.isFile()) contents.push(await readFile(entryPath, "utf8"));
  }
  return contents;
}

test("package build produces the same five public skills for every target", async () => {
  const manifest = await buildPackages();
  assert.deepEqual(manifest.packages, ["generic", "claude", "cursor", "codex", "copilot"]);
  assert.deepEqual(manifest.public_skills, ["onboarding", "analytics", "enrich-lead", "prospect", "sequence-load"]);
  assert.equal(manifest.private_skills_included, false);

  for (const target of manifest.packages) {
    const skillRoot = path.join(repositoryRoot, "dist", target, "apollo", "skills");
    assert.deepEqual((await readdir(skillRoot)).sort(), [...manifest.public_skills].sort());
    assert.match(await readFile(path.join(skillRoot, "onboarding", "SKILL.md"), "utf8"), /name: onboarding/);
    assert.match(await readFile(path.join(skillRoot, "prospect", "SKILL.md"), "utf8"), /name: prospect/);
  }

  const publicOutput = (await readTree(path.join(repositoryRoot, "dist"))).join("\n");
  assert.doesNotMatch(
    publicOutput,
    /replit-onboarding|inbound-website-visitors|"visibility"\s*:\s*"private"|\.local-scratch|raw[-_ ](?:payload|output|capture)/i,
  );
});

test("generic onboarding output excludes client-specific credential guidance", async () => {
  await buildPackages();
  const onboarding = await readFile(
    path.join(repositoryRoot, "dist", "generic", "apollo", "skills", "onboarding", "SKILL.md"),
    "utf8",
  );
  assert.doesNotMatch(onboarding, /replit|app[- ]?builder|api[-_ ]?key|\bsecrets?\b/i);
});
