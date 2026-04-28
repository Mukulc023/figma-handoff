#!/usr/bin/env node

import { mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));
const VERSION = pkg.version;

const claudeDir = join(homedir(), ".claude");
const skillDir = join(claudeDir, "skills", "figma-handoff");
const settingsPath = join(claudeDir, "settings.json");
const versionFile = join(skillDir, ".version");

// Check if already installed and up to date
if (existsSync(versionFile)) {
  const installed = readFileSync(versionFile, "utf-8").trim();
  if (installed === VERSION) {
    // Check for newer version on npm
    try {
      const latest = execSync("npm view figma-handoff-annotator version", { encoding: "utf-8" }).trim();
      if (latest !== VERSION) {
        console.log(`Update available: ${VERSION} → ${latest}`);
        console.log("Run: npx figma-handoff-annotator@latest\n");
      } else {
        console.log(`figma-handoff-annotator v${VERSION} is already installed and up to date.`);
      }
    } catch {
      console.log(`figma-handoff-annotator v${VERSION} is already installed.`);
    }
    process.exit(0);
  }
  console.log(`Updating figma-handoff-annotator: ${installed} → ${VERSION}\n`);
} else {
  console.log(`Installing figma-handoff-annotator v${VERSION}...\n`);
}

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
  "animation-extraction-snippet.md",
];

for (const ref of refs) {
  cpSync(join(__dirname, "references", ref), join(skillDir, "references", ref));
}

// Write version marker
writeFileSync(versionFile, VERSION);

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

console.log(`\nv${VERSION} installed! Open Claude Code, share a Figma URL, and say "handoff".`);
