import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadCatalog } from "../lib/catalog.mjs";
import { inspectInstallations, installSkills, targetDirectories } from "../lib/install.mjs";

test("installer exposes only the five public package targets", () => {
  assert.deepEqual(Object.keys(targetDirectories), ["generic", "claude", "cursor", "codex", "copilot"]);
});

test("installer copies only explicitly selected skills", async (context) => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "apollo-skills-"));
  context.after(() => rm(projectRoot, { recursive: true, force: true }));
  const catalog = await loadCatalog();

  const installed = await installSkills({ catalog, skillIds: ["analytics"], projectRoot, target: "generic" });
  assert.equal(installed.length, 1);
  const contents = await readFile(path.join(projectRoot, ".agents", "skills", "analytics", "SKILL.md"), "utf8");
  assert.match(contents, /name: analytics/);

  const status = await inspectInstallations({ catalog, projectRoot, target: "generic" });
  assert.equal(status.find((skill) => skill.id === "analytics").status, "current");
  assert.equal(status.find((skill) => skill.id === "prospect").status, "not-installed");
});

test("installer refuses to overwrite an existing skill without force", async (context) => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "apollo-skills-"));
  context.after(() => rm(projectRoot, { recursive: true, force: true }));
  const catalog = await loadCatalog();
  await installSkills({ catalog, skillIds: ["enrich-lead"], projectRoot });
  await assert.rejects(
    installSkills({ catalog, skillIds: ["enrich-lead"], projectRoot }),
    /already exists/,
  );
});

test("installer validates the whole plan before copying any skill", async (context) => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "apollo-skills-"));
  context.after(() => rm(projectRoot, { recursive: true, force: true }));
  const catalog = await loadCatalog();
  await installSkills({ catalog, skillIds: ["enrich-lead"], projectRoot });

  await assert.rejects(
    installSkills({ catalog, skillIds: ["analytics", "enrich-lead"], projectRoot }),
    /already exists/,
  );
  await assert.rejects(
    readFile(path.join(projectRoot, ".agents", "skills", "analytics", "SKILL.md"), "utf8"),
    /ENOENT/,
  );
});
