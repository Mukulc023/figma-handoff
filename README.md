# Figma Handoff Annotator

A **Claude Code skill** that automates Figma design-to-developer handoffs. It reads your Figma designs, places structured annotations directly on the canvas, and generates a PRD — all without leaving Figma.

## What it does

When a designer shares a Figma URL and says "handoff", this skill:

1. **Creates a Handoff Brief** frame on your Figma file for the designer to fill in
2. **Waits** for the designer to confirm the brief is complete
3. **Reads the brief**, traverses the design, and extracts prototype reactions
4. **Places annotations** (callouts, interaction notes, flow connectors, section banners, notes stickies) directly on the Figma canvas
5. **Generates a PRD** as a frame on the Figma file + a markdown copy

## Quick Install

```bash
npx github:Mukulc023/figma-handoff
```

This clones the repo, copies the skill files to `~/.claude/skills/figma-handoff/`, and adds the Granola MCP server to your Claude Code settings. After installation, just share a Figma URL in Claude Code and say "handoff".

## Manual Install

1. Clone this repo:
   ```bash
   git clone https://github.com/Mukulc023/figma-handoff.git
   ```
2. Run the installer:
   ```bash
   cd figma-handoff && node install.mjs
   ```
   Or manually copy `SKILL.md` and the `references/` folder to `~/.claude/skills/figma-handoff/`

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI or desktop app
- Figma MCP server connected in Claude Code
- A Figma file with a design flow to hand off
- *(Optional)* [Granola MCP server](references/granola-mcp-setup.md) for pulling meeting notes into PRDs

## How to use

1. Open Claude Code
2. Share a Figma URL pointing to your design flow
3. Say **"handoff"** (or "annotate this", "PRD this", "ready for engineering")
4. The skill creates a brief frame on your file — fill it in
5. Come back and say **"done"** — the skill annotates and generates the PRD

## Trigger phrases

- "handoff" / "dev handoff"
- "annotate this flow"
- "PRD this"
- "ready for engineering"
- "mark this up for developers"

## Annotation primitives

The skill places six types of annotations:

| Primitive | Purpose |
|-----------|---------|
| **Section Banner** | Groups screens by theme |
| **Pointer Callout** | Element-specific notes with category pills (BEHAVIOR/INTERACTION/CONTENT/PHASE) |
| **Interaction Note Card** | Transition and animation specs |
| **Notes Sticky** | General behavioral notes |
| **Trigger Label** | User action on flow connectors |
| **Flow Connector** | Screen-to-screen path labels |

## Project structure

```
figma-handoff/
├── README.md
├── package.json
├── install.mjs                           # npx installer script
├── SKILL.md                              # Main skill definition (two-phase workflow)
└── references/
    ├── annotation-primitives.md          # 6 annotation primitives with visual specs
    ├── brief-creation-snippet.md         # Plugin API JS for Handoff Brief frames
    ├── brief-frame-template.md           # 13-field brief template for designers
    ├── handoff-completeness-checklist.md # Pre-PRD content rubric
    ├── prd-template.md                   # PRD output structure
    └── granola-mcp-setup.md              # Granola MCP integration guide
```

## License

MIT
