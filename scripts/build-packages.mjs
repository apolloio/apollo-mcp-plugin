import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog, repositoryRoot } from "../lib/catalog.mjs";

async function copySkills(root, destination) {
  await cp(path.join(root, "skills"), path.join(destination, "skills"), { recursive: true });
}

async function copyPlugin(root, source, destination) {
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
  await copySkills(root, destination);
}

function assertSafeOutput(root, outputRoot) {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.resolve(outputRoot);
  if (!resolvedOutput.startsWith(`${resolvedRoot}${path.sep}`) || path.basename(resolvedOutput) !== "dist") {
    throw new Error(`Refusing to replace unsafe build directory: ${resolvedOutput}`);
  }
  return resolvedOutput;
}

export async function buildPackages({ root = repositoryRoot, outputRoot = path.join(root, "dist") } = {}) {
  const output = assertSafeOutput(root, outputRoot);
  const catalog = await loadCatalog(root);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  const claudePlugin = path.join(output, "claude", "apollo");
  await mkdir(path.join(claudePlugin, ".claude-plugin"), { recursive: true });
  await cp(path.join(root, ".claude-plugin", "plugin.json"), path.join(claudePlugin, ".claude-plugin", "plugin.json"));
  await cp(path.join(root, ".mcp.json"), path.join(claudePlugin, ".mcp.json"));
  await copySkills(root, claudePlugin);
  const claudeMarketplace = JSON.parse(await readFile(path.join(root, ".claude-plugin", "marketplace.json"), "utf8"));
  claudeMarketplace.plugins[0].source = "./apollo";
  await mkdir(path.join(output, "claude", ".claude-plugin"), { recursive: true });
  await writeFile(
    path.join(output, "claude", ".claude-plugin", "marketplace.json"),
    `${JSON.stringify(claudeMarketplace, null, 2)}\n`,
  );

  const cursorPlugin = path.join(output, "cursor", "apollo");
  await mkdir(path.join(cursorPlugin, ".cursor-plugin"), { recursive: true });
  await cp(path.join(root, ".cursor-plugin", "plugin.json"), path.join(cursorPlugin, ".cursor-plugin", "plugin.json"));
  await cp(path.join(root, ".mcp.json"), path.join(cursorPlugin, ".mcp.json"));
  await copySkills(root, cursorPlugin);

  await copyPlugin(root, path.join(root, "packages", "codex", "apollo"), path.join(output, "codex", "apollo"));
  await copyPlugin(root, path.join(root, "packages", "copilot", "apollo"), path.join(output, "copilot", "apollo"));

  const generic = path.join(output, "generic", "apollo");
  await mkdir(generic, { recursive: true });
  await copySkills(root, generic);
  await cp(path.join(root, "catalog"), path.join(generic, "catalog"), { recursive: true });
  await cp(path.join(root, "contracts"), path.join(generic, "contracts"), { recursive: true });
  await cp(path.join(root, ".mcp.json"), path.join(generic, ".mcp.json"));

  const manifest = {
    package_version: catalog.package_version,
    generated_from: "skills/",
    packages: ["generic", "claude", "cursor", "codex", "copilot"],
    public_skills: catalog.skills.map((skill) => skill.id),
    private_skills_included: false,
  };
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const manifest = await buildPackages();
  console.log(`Built ${manifest.packages.length} package targets at dist/.`);
}
