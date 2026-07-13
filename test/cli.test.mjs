import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runCli(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(root, "bin", "apollo-skills.mjs"), ...args], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("CLI lists all public skills", async () => {
  const result = await runCli(["list", "--json"]);
  assert.equal(result.code, 0);
  assert.deepEqual(JSON.parse(result.stdout).map((skill) => skill.id), [
    "onboarding",
    "analytics",
    "enrich-lead",
    "prospect",
    "sequence-load",
  ]);
});

test("CLI returns the versioned recommendation contract without installing", async () => {
  const result = await runCli(["recommend", "find decision makers matching my ICP", "--target", "cursor", "--json"]);
  assert.equal(result.code, 0);
  const response = JSON.parse(result.stdout);
  assert.equal(response.contract_version, "1.0.0");
  assert.equal(response.recommendations[0].skill_id, "prospect");
  assert.match(response.recommendations[0].install_command, /--target cursor$/);
});

test("CLI refuses non-interactive installation without explicit consent", async (context) => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "apollo-cli-"));
  context.after(() => rm(projectRoot, { recursive: true, force: true }));
  const result = await runCli(["add", "analytics", "--project", projectRoot]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /rerun with --yes/);
  await assert.rejects(access(path.join(projectRoot, ".agents", "skills", "analytics", "SKILL.md")));
});

test("CLI setup installs only onboarding after explicit consent and doctor sees it", async (context) => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "apollo-cli-"));
  context.after(() => rm(projectRoot, { recursive: true, force: true }));

  const setup = await runCli(["setup", "--target", "copilot", "--project", projectRoot, "--yes"]);
  assert.equal(setup.code, 0);
  assert.match(setup.stdout, /Installed onboarding 0\.3\.0/);
  await access(path.join(projectRoot, ".github", "skills", "onboarding", "SKILL.md"));
  await assert.rejects(access(path.join(projectRoot, ".github", "skills", "analytics", "SKILL.md")));

  const doctor = await runCli(["doctor", "--target", "copilot", "--project", projectRoot, "--json"]);
  assert.equal(doctor.code, 0);
  const statuses = JSON.parse(doctor.stdout);
  assert.equal(statuses.find((skill) => skill.id === "onboarding").status, "current");
  assert.equal(statuses.find((skill) => skill.id === "analytics").status, "not-installed");
});
