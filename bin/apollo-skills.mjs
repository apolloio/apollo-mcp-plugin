#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import process from "node:process";
import { loadCatalog, recommendSkills } from "../lib/catalog.mjs";
import {
  inspectInstallations,
  installSkills,
  planInstallation,
  targetDirectories,
} from "../lib/install.mjs";

export const recommendationContractVersion = "1.0.0";

function usage() {
  return `Apollo Agent Skills

Usage:
  apollo-skills setup [--target generic|claude|cursor|codex|copilot] [--project PATH] [--yes] [--force]
  apollo-skills list [--json]
  apollo-skills recommend <workflow> [--target TARGET] [--json]
  apollo-skills add <skill...> [--target TARGET] [--project PATH] [--yes] [--force]
  apollo-skills doctor [--target TARGET] [--project PATH] [--json]

setup installs only the public onboarding skill. setup and add show the destination, version, credit behavior, and write behavior, then require confirmation unless --yes is provided.`;
}

function requireOptionValue(rest, index, option) {
  const value = rest[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Option '${option}' requires a value.`);
  return value;
}

function parseArguments(argv) {
  const [command = "help", ...rest] = argv;
  const options = { target: "generic", projectRoot: process.cwd(), yes: false, force: false, json: false };
  const positional = [];

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--target") options.target = requireOptionValue(rest, index++, argument);
    else if (argument === "--project") options.projectRoot = requireOptionValue(rest, index++, argument);
    else if (argument === "--yes") options.yes = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--json") options.json = true;
    else if (argument.startsWith("--")) throw new Error(`Unknown option '${argument}'.`);
    else positional.push(argument);
  }
  return { command, options, positional };
}

function print(value, json) {
  if (json) console.log(JSON.stringify(value, null, 2));
  else console.log(value);
}

async function confirmInstall() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Interactive confirmation is unavailable. Review the plan and rerun with --yes.");
  }
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await readline.question("Install these skills? [y/N] ");
    return /^y(?:es)?$/i.test(answer.trim());
  } finally {
    readline.close();
  }
}

async function runInstallation({ catalog, skillIds, options }) {
  if (!targetDirectories[options.target]) throw new Error(`Unknown target '${options.target}'.`);
  const plan = planInstallation({
    catalog,
    skillIds,
    target: options.target,
    projectRoot: options.projectRoot,
  });
  console.log(`Target: ${plan.target}\nDestination: ${plan.destinationRoot}`);
  plan.skills.forEach((skill) => {
    console.log(`- ${skill.id} ${skill.version}\n  Credits: ${skill.credit_behavior}; Writes: ${skill.write_behavior}`);
  });
  if (!options.yes && !(await confirmInstall())) {
    console.log("Installation cancelled.");
    return;
  }
  const installed = await installSkills({
    catalog,
    skillIds,
    target: options.target,
    projectRoot: options.projectRoot,
    overwrite: options.force,
  });
  installed.forEach((skill) => console.log(`Installed ${skill.id} ${skill.version} at ${skill.destination}`));
}

async function main() {
  const { command, options, positional } = parseArguments(process.argv.slice(2));
  if (command === "help" || command === "--help" || command === "-h") {
    console.log(usage());
    return;
  }

  const catalog = await loadCatalog();

  if (command === "setup") {
    if (positional.length > 0) throw new Error("setup does not accept skill names.");
    await runInstallation({ catalog, skillIds: ["onboarding"], options });
    return;
  }

  if (command === "list") {
    if (positional.length > 0) throw new Error("list does not accept positional arguments.");
    const rows = catalog.skills.map(({ id, version, description, credit_behavior, write_behavior }) => ({
      id,
      version,
      description,
      credit_behavior,
      write_behavior,
    }));
    if (options.json) print(rows, true);
    else rows.forEach((skill) => console.log(`${skill.id} ${skill.version}\n  ${skill.description}\n  Credits: ${skill.credit_behavior}; Writes: ${skill.write_behavior}`));
    return;
  }

  if (command === "recommend") {
    if (positional.length === 0) throw new Error("Describe the workflow to receive skill recommendations.");
    if (!targetDirectories[options.target]) throw new Error(`Unknown target '${options.target}'.`);
    const recommendations = recommendSkills(catalog, positional.join(" ")).map(({ score, ...skill }) => ({
      skill_id: skill.id,
      version: skill.version,
      reason: skill.description,
      visibility: skill.visibility,
      required_tools: skill.required_tools,
      install_command: `apollo-skills add ${skill.id} --target ${options.target}`,
    }));
    const response = { contract_version: recommendationContractVersion, recommendations };
    if (options.json) print(response, true);
    else if (recommendations.length === 0) console.log("No Apollo skill clearly matches that workflow.");
    else recommendations.forEach((skill) => console.log(`${skill.skill_id}: ${skill.reason}\n  ${skill.install_command}`));
    return;
  }

  if (command === "doctor") {
    if (positional.length > 0) throw new Error("doctor does not accept positional arguments.");
    const results = await inspectInstallations({
      catalog,
      target: options.target,
      projectRoot: options.projectRoot,
    });
    if (options.json) print(results, true);
    else results.forEach((result) => console.log(`${result.id}: ${result.status}${result.path ? ` (${result.path})` : ""}`));
    return;
  }

  if (command === "add") {
    await runInstallation({ catalog, skillIds: positional, options });
    return;
  }

  throw new Error(`Unknown command '${command}'.\n\n${usage()}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
