---
name: figma-handoff-annotator
description: Headout's standard process for turning a Figma design flow into a developer handoff. Two phases — places a Handoff Brief frame on the Figma file, then (after designer fills it) annotates the designs and generates a PRD. Trigger on Figma URLs with words like "handoff", "dev handoff", "annotate this flow", "PRD this", "ready for engineering", "prep for dev", "mark this up for developers".
---

# Figma Handoff Annotator

Two-phase skill for design-to-dev handoffs in Headout's house style.

**Phase 1** — Create a "Handoff Brief" frame on the Figma file → hand back to designer → STOP.
**Phase 2** — Read filled brief → traverse design → place annotations → generate PRD.

Sources: Figma file (screens, prototype reactions, animations, layers), the brief frame, optional Linear ticket, optional Granola meeting notes.

## Trigger phrases

"handoff", "dev handoff", "annotate this", "PRD this flow", "ready for engineering", "mark up the design", "document this flow for devs", "generate the PRD", "create the spec" — any of these alongside a Figma URL.

**Do NOT trigger for:** pure design critique, building UI from a design, internal exploration not going to engineering.

## Conversation state

Track after Step 2 — never ask the user to re-share:
- `flowFileKey`, `flowNodeId`, `briefNodeId`, `briefPageName`, `briefUrl`

---

## Phase 1 — Brief Creation (Steps 1–3)

### Step 1: Parse the Figma URL

Extract `fileKey` and `nodeId`. URL uses dash separator (e.g. `5570-46495`); API uses colon (`5570:46495`). Confirm briefly what flow this is for. Don't ask for flow details — that's what the brief is for.

### Step 2: Create the brief

**Read `references/brief-creation-snippet.md` now.** Use `Figma:use_figma` with that JS template, substituting `<TARGET_NODE_ID>`. Capture `briefId`, `page`, `position`, `size` from the response. Construct brief URL: `https://www.figma.com/design/{flowFileKey}/_?node-id={briefId-with-dashes}`

If `use_figma` fails, tell user to open Figma desktop app and approve. Retry — don't skip.

### Step 3: Hand back and STOP

Send: brief URL + "fill in the fields, let me know when ready." **End your turn.** Do NOT read the brief or call any tools — the designer hasn't filled it in yet.

---

## Phase 2 — Annotation & PRD (Steps 4–11)

### Step 4: Wait for confirmation

Look for: "done", "filled", "ready", "go ahead", etc. If unrelated question, answer without proceeding. If user says "just go ahead" with empty brief, warn once — empty fields become open questions.

### Step 5: Read the filled brief

Use `briefNodeId` from memory. Call `Figma:get_design_context` with `fileKey: flowFileKey`, `nodeId: briefNodeId`, `excludeScreenshot: true`. Parse 13 fields; placeholder `"— write here —"` = empty = open question. Fallback: ask user to paste contents.

### Step 6: Map the flow structure

Call `Figma:get_metadata` on `flowNodeId` for screen-level overview. Identify mobile screens (typically 375×812) vs. existing annotations.

For each screen individually (NOT whole section — times out), call `Figma:get_design_context` to extract:
- Notable component instances by layer name
- Visible text content

**MANDATORY — extract animation specs via Plugin API (not get_design_context).** `get_design_context` often omits prototype reaction details. Instead, use `Figma:use_figma` to traverse every node and read reactions directly. **Read `references/animation-extraction-snippet.md` now.** Run the snippet for each screen to get the complete list of transitions with trigger, action, destination, easing, and duration. This is the only reliable way to get full animation data — never mark specs as TBD without running this extraction first.

**MANDATORY before placing annotations:** For scrolling screens (>1500px tall), use `Figma:use_figma` to traverse children and capture real bounding boxes:

```javascript
const main = await figma.getNodeByIdAsync(longScreenContentId);
const sections = main.children.map(c => ({
  name: c.name, absY: c.absoluteBoundingBox.y, height: c.absoluteBoundingBox.height
}));
```

Use these real Y values for annotation placement — never assume positions.

### Step 7: Pull external context

- **Linear ticket URL** in brief → retrieve via Linear connector for user problem, success metric, constraints.
- **Granola URL** (`granola.ai` or shared link) in "Related work" → fetch via Granola MCP: search meeting, retrieve notes/summary/action items. Fold into PRD's "Why" and "Context". If Granola MCP not connected: *"I see a Granola link but the Granola MCP server isn't connected. Paste the relevant notes here, or add it via `references/granola-mcp-setup.md`."*

### Step 8: Plan annotations

**Read `references/annotation-primitives.md` now.** Build a plan covering ALL six primitives:

1. **Section Banners** — one per screen cluster
2. **Pointer Callouts** — element-specific notes with category pills (BEHAVIOR/INTERACTION/CONTENT/PHASE)
3. **Interaction Note Cards** — every transition/animation with spec format `animate: ...; animation-curve: ...; animation-duration: ...;` (extracted via Plugin API in Step 6)
4. **Notes Sticky** — general notes (dependencies, phases, assets, backend)
5. **Trigger Labels** — user action on flow arrows
6. **Flow Connectors** — ALL CAPS between-screen path labels

**Incomplete handoff = one with only Pointer Callouts.** Every transition needs an Interaction Note Card with actual specs from the Plugin API. 3+ general notes → Notes Sticky required.

Share plan summary before placing (e.g. "5 banners, 11 callouts, 4 interaction notes, 1 sticky").

### Step 9: Place annotations

Use `Figma:use_figma` on `flowFileKey`. Place on layer **"Handoff Annotations [YYYY-MM-DD]"**. Follow `references/annotation-primitives.md` exactly for all visual specs, connector implementation, and placement rules.

**Critical rules (non-negotiable):**
- `figma.createConnector()` does NOT work in design files — use `figma.createVector()` + `setVectorNetworkAsync()` (see annotation-primitives.md Primitive 2)
- **All annotations for one screen go on the SAME side** (left or right) — pick based on available space. Never mix sides per screen
- Place all notes in a single column 60px from screen edge. Callouts and interaction cards share the same column, sorted by anchor Y
- Connect each note to its target UI element with an L-shaped elbow connector that routes through a consistent vertical channel (see `mkElbow` in annotation-primitives.md)
- Run anti-overlap algorithm for vertically stacked notes (min 28px gap)
- Inter font: "Semi Bold" (with space)
- Verify creation count — if 0 of an expected type, investigate

If >20 annotations, confirm before placing.

### Step 10: Completeness check

**Read `references/handoff-completeness-checklist.md` now.** For each item: covered → PRD, N/A → skip, gap → PRD Open Questions. Never silently skip gaps.

### Step 11: Generate PRD

**Read `references/prd-template.md` now.** The PRD is a **Figma frame on the canvas** (primary) + markdown file (secondary).

**Frame placement:** Right of section (`flowNodeBbox.x + width + ~300px`), top-aligned. If no room, below.

**Frame style:**
- 720–760px wide, white fill `{r:1, g:1, b:1}`, 56px padding, 16px radius, 1px stroke `{r:0.88, g:0.88, b:0.9}`
- Auto-layout vertical, 28px section spacing
- Typography: Eyebrow 11px Semi Bold muted gray | Title 36px Semi Bold dark `{r:0.1, g:0.1, b:0.12}` | H2 22px Semi Bold dark | H3 15px Semi Bold dark | Body 14px Regular dark gray `{r:0.25, g:0.25, b:0.28}` 165% line-height

**Content:** Follow prd-template.md, trim for Figma (800–1200 words). Lead with TL;DR, end with Open Questions.

**After placing:**
- Capture PRD node ID → construct URL
- Append PRD URL to Notes Sticky
- Focus viewport on PRD

**Final message:** Figma URL to PRD frame + Figma URL to annotations group + markdown PRD via `present_files`.

---

## Phrasing style

- **Pointer callouts:** lowercase, conversational, <15 words. *"in case the banner content goes in 2 lines, we truncate it"*
- **Animation specs:** terse, exact units (ms, percentage). *"ease-in-out; animation-duration: 300ms;"*
- **Section banners:** noun phrases. *"M-ticket updates"*, *"Cancellation flow"*
- **Flow connectors:** ALL CAPS, action-oriented, straight quotes. *"SELECTING 'PROCEED TO CANCEL' BUTTON"*

## Hard rules

- Never invent prototype connections or animation specs — extract via Plugin API (`references/animation-extraction-snippet.md`). If Plugin API fails, ask the user for specs rather than writing TBD
- Never delete/modify existing designer annotations — only add to fresh layer
- Never read the brief in the same turn you created it
- Never re-ask for links already in conversation memory
- Empty brief fields → Open Questions, never silently skipped
- PRD must be a Figma canvas frame, not markdown-only
- Always verify annotation counts after creation
