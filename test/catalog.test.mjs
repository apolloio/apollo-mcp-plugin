import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { loadCatalog, recommendSkills, repositoryRoot } from "../lib/catalog.mjs";

test("catalog exposes the five canonical public skills on every public surface", async () => {
  const catalog = await loadCatalog();
  assert.equal(catalog.package_version, "0.3.0");
  assert.deepEqual(catalog.surfaces, ["generic", "claude", "cursor", "codex", "copilot"]);
  assert.deepEqual(catalog.skills.map((skill) => skill.id).sort(), [
    "analytics",
    "enrich-lead",
    "onboarding",
    "prospect",
    "sequence-load",
  ]);
  assert.ok(catalog.skills.every((skill) => skill.visibility === "public"));
  assert.ok(catalog.skills.every((skill) =>
    assert.deepEqual(skill.supported_surfaces, catalog.surfaces) === undefined));
});

test("recommendations select the relevant skill without installing it", async () => {
  const catalog = await loadCatalog();
  const recommendations = recommendSkills(catalog, "Find decision makers matching my ICP");
  assert.equal(recommendations[0].id, "prospect");
  assert.ok(recommendations.length <= 3);

  const broadWorkflow = catalog.skills.map((skill) =>
    `${skill.id} ${skill.description}`).join(" ");
  const broadRecommendations = recommendSkills(catalog, broadWorkflow);
  assert.equal(broadRecommendations.length, 3);
  assert.deepEqual(broadRecommendations, recommendSkills(catalog, broadWorkflow));
});

test("recommendation contract is explicitly versioned", async () => {
  const schema = JSON.parse(await readFile(
    path.join(repositoryRoot, "contracts", "recommend-apollo-skills.schema.json"),
    "utf8",
  ));
  assert.equal(schema.properties.contract_version.const, "1.0.0");
  assert.equal(schema.properties.output.properties.contract_version.const, "1.0.0");
  assert.equal(schema.properties.input.properties.workflow.pattern, ".*\\S.*");
  assert.equal(schema.properties.output.properties.recommendations.maxItems, 3);
  assert.ok(schema.required.includes("contract_version"));
});
