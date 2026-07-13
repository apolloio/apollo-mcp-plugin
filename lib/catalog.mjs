import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export async function loadCatalog(root = repositoryRoot) {
  const catalogPath = path.join(root, "catalog", "skills.yaml");
  const catalog = parse(await readFile(catalogPath, "utf8"));

  if (!catalog || !Array.isArray(catalog.skills)) {
    throw new Error(`${catalogPath} must define a skills array.`);
  }

  return catalog;
}

export function findSkill(catalog, skillId) {
  return catalog.skills.find((skill) => skill.id === skillId);
}

export function recommendSkills(catalog, workflow) {
  const normalized = workflow.toLowerCase();
  const words = new Set(normalized.match(/[a-z0-9]+/g) ?? []);

  return catalog.skills
    .map((skill) => {
      const terms = [skill.id, skill.description, ...(skill.triggers ?? [])];
      const score = terms.reduce((total, term) => {
        const candidate = term.toLowerCase();
        if (normalized.includes(candidate)) return total + 4;
        const matches = (candidate.match(/[a-z0-9]+/g) ?? []).filter((word) =>
          words.has(word),
        );
        return total + matches.length;
      }, 0);
      return { ...skill, score };
    })
    .filter((skill) => skill.score > 0)
    .sort((left, right) =>
      right.score - left.score || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
    .slice(0, 3);
}
