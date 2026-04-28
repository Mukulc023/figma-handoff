#!/usr/bin/env node

import { mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const claudeDir = join(homedir(), ".claude");
const skillDir = join(claudeDir, "skills", "figma-handoff");
const settingsPath = join(claudeDir, "settings.json");

console.log("Installing figma-handoff-annotator skill...\n");

// 1. Copy skill files
mkdirSync(join(skillDir, "references"), { recursive: true });

cpSync(join(__dirname, "SKILL.md"), join(skillDir, "SKILL.md"));

const refs = [
  "annotation-primitives.md",
  "brief-creation-snippet.md",
  "brief-frame-template.md",
  "handoff-completeness-checklist.md",
  "prd-template.md",
  "granola-mcp-setup.md",
];

for (const ref of refs) {
  cpSync(join(__dirname, "references", ref), join(skillDir, "references", ref));
}

console.log(`Skill files installed to: ${skillDir}`);

// 2. Add Granola MCP server to Claude Code settings
let settings = {};
if (existsSync(settingsPath)) {
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
  } catch {
    console.warn("Warning: Could not parse existing settings.json, creating fresh config.");
    settings = {};
  }
}

if (!settings.mcpServers) {
  settings.mcpServers = {};
}

if (settings.mcpServers.granola) {
  console.log("Granola MCP server already configured — skipping.");
} else {
  settings.mcpServers.granola = {
    url: "https://mcp.granola.ai/mcp",
  };
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  console.log("Granola MCP server added to ~/.claude/settings.json");
  console.log("  On first use, you'll be prompted to authenticate with Granola via OAuth.");
}

console.log("\nYou're all set! Open Claude Code, share a Figma URL, and say \"handoff\".");
