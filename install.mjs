#!/usr/bin/env node

import { execSync } from "child_process";
import { mkdirSync, cpSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const skillDir = join(homedir(), ".claude", "skills", "figma-handoff");

console.log("Installing figma-handoff-annotator skill...\n");

mkdirSync(join(skillDir, "references"), { recursive: true });

// Copy SKILL.md
cpSync(join(__dirname, "SKILL.md"), join(skillDir, "SKILL.md"));

// Copy references
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

console.log(`Skill installed to: ${skillDir}`);
console.log("\nYou're all set! Open Claude Code, share a Figma URL, and say \"handoff\".");
