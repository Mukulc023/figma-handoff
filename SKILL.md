---
name: figma-handoff-annotator
description: Headout's standard process for turning a Figma design flow into a developer handoff. The skill works in two phases — first it places a Handoff Brief frame on the Figma file for the designer to fill in, then (after the designer confirms it's filled) it reads the brief, annotates the designs with callouts, animation specs, section banners, and flow connectors, and generates a matching PRD. Use this skill any time someone shares a Figma URL alongside words like "handoff", "dev handoff", "annotate this flow", "PRD this", "ready for engineering", "prep for dev", or "mark this up for developers". Default to using this skill whenever a Figma URL appears in a context that involves handing work off to engineers, even if the user didn't say the word "handoff" explicitly.
---

# Figma Handoff Annotator

This skill encodes Headout's house style for design-to-development handoffs. It runs in two phases:

**Phase 1 — Brief generation.** When a designer shares a Figma URL and asks for a handoff, the skill creates a "Handoff Brief" frame directly on their file (next to the linked node). The designer fills this in. The skill remembers where it placed the brief so the designer never has to re-share the link.

**Phase 2 — Annotation and PRD generation.** Once the designer confirms the brief is filled, the skill reads it, traverses the design, and produces two outputs:

1. **Annotations placed back onto the Figma file** — using the team's established primitives (pointer callouts, animation spec cards, section banners, flow connectors).
2. **A PRD in markdown** — explaining what's changing, why, and what engineering should keep in mind.

The skill combines three sources of information: what's already in the Figma file (screens, prototype reactions, animations, layer names), the brief frame the designer fills in, and an optional linked Linear ticket.

## When to use this skill

Trigger on any of:
- A Figma URL is shared in a handoff or dev-prep context
- The user says "handoff", "dev handoff", "annotate this", "PRD this flow", "ready for engineering", "mark up the design", "document this flow for devs"
- The user asks to "generate the PRD" or "create the spec" alongside a design link

Do NOT use this skill for:
- Pure design feedback or critique
- Building UI from a design (use Figma's get_design_context for that)
- Internal design exploration that isn't going to engineering

## Inputs the skill needs

**Required:**
- A Figma URL pointing to the section or top-level frame containing the flow

That's it for the start. The skill creates the brief frame itself in Step 2 — the designer doesn't need to prepare anything in advance.

**Pulled in later (during or after the brief is filled):**
- Brief content (filled in by the designer in Step 4)
- Linked Linear ticket URL (from the Linear ticket field of the brief)
- Granola or meeting notes URL (from the Related Work field)

If the designer fills in the brief but skips fields, the empty fields become "Open Questions" in the PRD — the skill never silently invents missing context.

## Workflow

This workflow spans multiple user turns. The skill creates a brief frame, hands it back to the designer, waits for them to fill it in, then proceeds. Don't rush past the wait step.

### State to keep in conversation memory

After Step 2, track these and refer to them by memory on subsequent turns. Do NOT ask the user to re-share any of these — that's the whole point of this design:

- `flowFileKey` — Figma file key of the design being handed off
- `flowNodeId` — node ID the user originally linked to (the section/frame containing the flow)
- `briefNodeId` — node ID of the Handoff Brief frame the skill creates in Step 2
- `briefPageName` — page name where the brief was placed
- `briefUrl` — direct Figma URL pointing at the brief

### Step 1: Receive the Figma URL

The user shares a Figma URL like `https://www.figma.com/design/{fileKey}/{filename}?node-id={nodeId}&...`. Parse fileKey and nodeId from it. Note: in URLs, the node ID uses a dash separator (e.g. `5570-46495`); in API calls it uses a colon (`5570:46495`).

Confirm briefly what flow this is for — pull the filename from the URL or the page context. Don't ask for clarification on flow details; that's what the brief is for.

### Step 2: Generate the Handoff Brief on the file

Use `Figma:use_figma` with the JS template in `references/brief-creation-snippet.md`. Substitute `<TARGET_NODE_ID>` with the user's nodeId (colon-separated form). The snippet creates a 480px-wide brief frame with all 13 fields, placed 540px to the left of the user's target node.

After the call returns, capture from the response: `briefId`, `page`, `position`, `size`. Construct the brief URL as:
```
https://www.figma.com/design/{flowFileKey}/_?node-id={briefId-with-dashes}
```
e.g. if `briefId` is `5572:6456`, the URL ends with `node-id=5572-6456`.

If the `use_figma` call fails (no approval, file not open, etc.), tell the user clearly what to do (open the Figma desktop app, approve the prompt) and try again — don't skip ahead.

### Step 3: Hand the brief back and stop

Send a short message to the user containing:
- The direct URL to the brief frame
- A request to fill it in
- A statement that you'll wait for their confirmation before continuing

Example phrasing: *"I've placed a Handoff Brief on your file — [link]. Fill in the fields, then come back here and let me know when it's ready. I won't proceed until you confirm."*

**End your turn here.** Do NOT call `Figma:get_design_context` or any other tool to read the brief in the same turn — the designer hasn't filled it in yet.

### Step 4: Wait for confirmation

The user will come back. Look for explicit confirmation: "done", "filled", "ready", "go ahead", "I've added the details", "you can proceed", or similar. If they ask an unrelated question, answer it without proceeding.

If they come back without filling the brief and say "just go ahead" or similar, ask once whether they're sure — a partially filled brief still works (empty fields become open questions in the PRD), but a completely empty brief means the PRD will be thin.

### Step 5: Read the filled brief

Use the `briefNodeId` from conversation memory — do NOT ask the user for the link again. Call `Figma:get_design_context` with `fileKey: flowFileKey`, `nodeId: briefNodeId`, and `excludeScreenshot: true`.

Parse each of the 13 fields by locating the field label and reading the text node that follows it. If a field still contains the literal placeholder *"— write here —"*, treat it as empty (open question, not content).

If the call times out or returns garbled content, fall back to: *"I couldn't read the brief automatically — can you paste its contents here?"* This is a fallback, not the default path.

### Step 6: Map the flow structure

Now traverse the actual designs. Use `Figma:get_metadata` on the section node (`flowNodeId`) for the screen-level overview. Identify:
- All top-level frames matching mobile screen dimensions (typically 375×812)
- Which frames are screens vs. existing annotation primitives (signatures in `references/annotation-primitives.md`)

For each screen, call `Figma:get_design_context` on its individual node ID (NOT the whole section — that times out for large files). Extract:
- Prototype reactions: trigger type (TAP, HOVER, AFTER_TIMEOUT), action (NAVIGATE, OPEN_OVERLAY), destination, transition type (SMART_ANIMATE, DISSOLVE, PUSH), duration ms, easing curve
- Notable component instances by layer name (Banner, Notice, Sticky, Notification Bars, etc.)
- Visible text content

If `get_design_context` times out repeatedly, fall back to processing one cluster at a time and warn the user the analysis may be incomplete.

**MANDATORY: Discover real section Y-positions before placing any annotation.** This is the single most common cause of misaligned annotations. For each long scrolling screen (anything taller than ~1500px), use `Figma:use_figma` to traverse its direct children and capture the bounding box of each named section frame. Example traversal:

```javascript
const main = await figma.getNodeByIdAsync(longScreenContentId);
const sections = main.children.map(c => ({
  name: c.name,                     // e.g. "Your guides", "Route map"
  absY: c.absoluteBoundingBox.y,    // use this for anchor Y values
  height: c.absoluteBoundingBox.height
}));
```

The output gives you a map of `{ section name → real Y coordinate }`. Use these real Y values when placing pointer callouts and interaction notes — never assume positions based on "typical" experience-page layouts. Do not skip this step even if you have a strong intuition about where sections sit; the cost of being wrong (a full re-do) is much higher than one extra plugin call.

### Step 7: Pull external context

If the brief includes a Linear ticket URL, retrieve it via the Linear connector for the "why" — user problem, success metric, constraints.

If the brief's "Related work" field includes a Granola meeting notes URL (anything matching `granola.ai` or a Granola-shared link), fetch the meeting content using the Granola MCP server. Use the Granola tools to:
1. Search for the meeting by URL, title, or date mentioned in the brief
2. Retrieve the full notes, transcript summary, and action items
3. Extract design decisions, constraints, and requirements discussed in the meeting

Fold Granola context into the PRD's "Why" and "Context" sections. If specific action items from the meeting relate to the handoff, list them in the PRD. If the Granola MCP server is not connected, tell the user: *"I see a Granola link but don't have the Granola MCP server connected. You can add it in Claude Code settings, or paste the relevant meeting notes here."*

**Granola MCP setup** — The official Granola MCP server is at `https://mcp.granola.ai/mcp` (Streamable HTTP transport, OAuth 2.0 auth). Users can connect it in their Claude Code MCP settings. See `references/granola-mcp-setup.md` for configuration details.

### Step 8: Plan the annotations

Build an annotation plan and share a brief summary with the user *before* placing anything. The plan should account for ALL six primitives (see `references/annotation-primitives.md`), not just pointer callouts:

1. **Section Banners** — group screens by theme (one per cluster)
2. **Pointer Callouts** — element-specific short notes with category pills
3. **Interaction Note Cards** — every transition, animation, or non-trivial interaction (overlays, expansions, audio play, sheet animations, page transitions). Use spec format `animate: ...; animation-curve: ...; animation-duration: ...;` with `TBD` for unknowns
4. **Notes Sticky** — collected general notes (dependencies, phase boundaries, asset references, backend specs)
5. **Trigger Labels** — on flow arrows, what user action causes the transition
6. **Flow Connectors** — major between-screen path labels

**A handoff that has only Pointer Callouts is incomplete.** Every flow has transitions; every transition deserves an Interaction Note Card. If you can't find spec data for a transition, place the card with `TBD` values and surface it in the PRD's Open Questions — don't skip the card entirely.

Share a brief plan summary with the user (e.g. "I'm placing 5 banners, 11 pointer callouts, 4 interaction notes, 1 notes sticky, and the PRD frame") before doing the work.

### Step 9: Place annotations on the canvas

Use `Figma:use_figma` to run Plugin API code on the same `flowFileKey`. Place annotations on a dedicated layer named **"Handoff Annotations [YYYY-MM-DD]"**. After placing, focus the viewport on the group.

**Critical — these placement choices are non-negotiable.** Getting them wrong produces a chaotic file the team will reject. See `references/annotation-primitives.md` Primitive 2 for the full implementation, but the key points:

1. **Never use `figma.createConnector()` in Figma design files.** It silently fails — creates nothing, no error thrown. This was discovered by post-mortem audit. Use manual vector paths via `figma.createVector()` instead.
2. **Use `setVectorNetworkAsync()` for elbows** — it gives rounded corners at bends and per-end arrow control:
   - 4 vertices, 3 segments
   - `cornerRadius: 8` on the two bend vertices
   - `strokeCap: 'ARROW_LINES'` only on the last vertex (arrow lands at screen anchor, not note edge)
3. **Connect note edges directly to screen coordinates** — no invisible anchor rectangles needed. Vectors use absolute coordinates so you specify exactly where the arrow tip lands.
4. **Place notes in the empty gutter immediately adjacent to the screen** they annotate (~80px from screen edge), not stacked far away.
5. **Run the anti-overlap algorithm** when stacking multiple notes vertically — sort by anchor Y, align note mid with anchor, push down with min 16px gap if would overlap.
6. **Use the four category pills** (BEHAVIOR, INTERACTION, CONTENT, PHASE) so engineering can scan by type. Default to BEHAVIOR if unsure.
7. **Use Inter font** ("Semi Bold" with a space, not "SemiBold").
8. **Verify after creation** — log the count of vectors actually created and which mode succeeded (`network` vs `paths` fallback). If zero elbows ended up in the group, something silently failed.

If the annotation count is large (>20), confirm before placing: "I'm about to place 34 annotations. Continue?"

### Step 10: Run the completeness check

Walk through `references/handoff-completeness-checklist.md`. For each item in the rubric, decide: covered, N/A, or gap. Gaps go into the PRD's Open Questions, never silently skipped.

This step matters because the most valuable PRD content is the stuff that *isn't* visually obvious from the design alone (states, asset list, performance flags, API dependencies).

### Step 11: Generate the PRD as a frame on the Figma file

The PRD is a **Figma frame placed on the same file as the design**, near the user's originally linked node. This is the primary deliverable. A markdown copy is also saved to `/mnt/user-data/outputs/[flow-name]-PRD.md` as a secondary artifact for engineers who want to copy-paste into Slack or Linear, but the Figma frame is the canonical version.

**Frame placement:**

Place the PRD frame just outside the right edge of the section containing the flow (typically `flowNodeBbox.x + flowNodeBbox.width + ~300px`), top-aligned with the section. If there's no horizontal room, place it below the section instead. The PRD should be visually adjacent to the design — same canvas, same eyeline. Designers and engineers should be able to see the design and read the PRD without switching files.

**Frame style:**

- **Width:** 720–760px (readable line length for body copy)
- **Background:** dark fill `{r:0.11, g:0.11, b:0.13}` for canvas-friendly contrast
- **Padding:** 56px on all sides
- **Section spacing:** 28px between sections, 1px dividers between major sections
- **Corner radius:** 16px
- **Auto-layout vertical**, primary axis AUTO, counter axis FIXED

**Typography hierarchy:**

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Eyebrow (date/designer line) | 11px | Semi Bold | muted gray, 12% letter-spacing |
| Document title | 36px | Semi Bold | white |
| Section heading | 22px | Semi Bold | white |
| Sub-heading (within a section) | 15px | Semi Bold | white |
| Body | 14px | Regular | light gray, 165% line-height |

**Content structure** — follow `references/prd-template.md` but trim aggressively for the Figma version. Aim for 800–1200 words on the canvas, lead with TL;DR, end with Open Questions. The full markdown copy can be longer.

**After placing:**

- Capture the PRD frame's node ID and construct a direct URL
- Append the PRD URL to the Notes Sticky on the canvas (so anyone looking at the design can jump to the PRD)
- Focus the viewport on the PRD frame so the user can see it immediately

In the final message to the user, share three things: the Figma URL pointing at the PRD frame, the Figma URL pointing at the annotations group, and the markdown PRD file via `present_files`.

## Reference files

Read these as needed:

- **`references/brief-creation-snippet.md`** — JS template for `Figma:use_figma` to create the brief frame. Read this before Step 2.
- **`references/annotation-primitives.md`** — exact visual specs and phrasing style for each of the 5 annotation types. Read this before Step 8 (planning) and Step 9 (placing).
- **`references/brief-frame-template.md`** — documentation of what's in the brief and why each field exists. Useful as a reference when parsing the brief in Step 5 or if the designer asks about a field.
- **`references/handoff-completeness-checklist.md`** — content rubric to run through after annotations are placed and before the PRD is written. Catches gaps the visual design alone won't surface (assets, states, accessibility, performance flags).
- **`references/prd-template.md`** — output structure for the PRD. Read this before Step 11.
- **`references/granola-mcp-setup.md`** — how to connect the Granola MCP server so the skill can pull meeting notes automatically.

## Phrasing style across all annotations

These conventions came from analyzing the team's existing handoffs. Match them exactly — they're how the output reads as "Headout style" rather than generic.

- **Pointer callouts** are lowercase and conversational. *"in case the banner content goes in 2 lines, we truncate it"* — not *"In case the banner content overflows two lines, we apply truncation."* Keep them under ~15 words.
- **Animation spec rows** are terse and technical. Use exact units (ms, m/s as the team writes it, percentage). Easing strings like *"ease-in-out; animation-duration: 300ms;"* or *"custom-bezier (0.7,0,0.3,1); animation-duration: 300ms;"*.
- **Section banner titles** are noun phrases describing the theme: *"M-ticket updates"*, *"Cancellation flow"*, *"Edge cases"*. Subtitles describe the specific variant: *"Banner entry animation"*, *"For long queues"*, *"When banner exists"*.
- **Flow connectors** are ALL CAPS, action-oriented: *"SELECTING 'PROCEED TO CANCEL' BUTTON"*, *"DIRECTLY TAKE TO THE REFUND DETAILS SCREEN"*. Use straight quotes inside the label, not curly.

## Things to never do

- Never invent prototype connections that aren't in the file. If you can't tell how two screens connect, leave it unannotated and put the question in the PRD's "Open Questions" section.
- Never make up animation specs. If a transition has no Smart Animate properties set, write `TBD;` in the Interaction Note Card's spec block and flag it in Open Questions — don't invent values.
- Never delete or modify existing annotations the designer placed manually. Only add to a fresh annotations layer.
- Never read the brief in the same turn you created it (Step 2 → Step 5 must span at least two turns; the designer needs time to fill it in).
- Never ask the user to re-share the Figma link, the brief link, or anything else they already gave you. Track these in conversation memory.
- Never silently skip an empty brief field — every empty field becomes an Open Question in the PRD.
- **`figma.createConnector()` does NOT exist in Design files — only FigJam.** Use `figma.createVector()` with `setVectorNetworkAsync()` instead. Pre-normalize vertices so the bounding box starts at (0,0), then set `arrow.y = Math.min(startY, endY)`. See `references/annotation-primitives.md` Primitive 2 for the corrected elbow pattern.
- **Never anchor annotations to assumed Y-positions.** For any scrolling screen, traverse the real section bounding boxes first (Step 6) and use those exact Y values. "Typical experience-page layout" guesses are wrong by 500–1500px in practice and cause every callout to point at the wrong UI element.
- **Never anchor a connector to a screen frame as a whole** — point at a specific UI element via an invisible 2×2 anchor rectangle at the precise coordinate.
- **Never stack all callouts in a single faraway column** with long arrows reaching across the canvas. Place notes in the gutter adjacent to the relevant screen.
- **Never produce a handoff with only Pointer Callouts.** If the flow has any transitions or animations, Interaction Note Cards are required. If there are 3+ general behavioral notes, a Notes Sticky is required.
- **Never deliver the PRD only as a markdown file.** The PRD must be placed as a frame on the Figma canvas, next to the design. Markdown is a secondary copy.
- **After placing annotations, always verify the count** — the `use_figma` return should report counts of each primitive created. If a "successful" run produces 0 of any expected primitive type, investigate before declaring done.

## Output checklist

Before declaring done, verify:
- [ ] Every prototype reaction has a Flow Connector or Trigger Label, or a noted exception
- [ ] Every transition / animation / non-trivial interaction has an Interaction Note Card (TBD specs flagged in Open Questions if data was unavailable)
- [ ] If the flow has 3+ general behavioral notes, they're consolidated into a Notes Sticky
- [ ] PRD frame is placed on the Figma canvas, adjacent to the section being handed off
- [ ] PRD frame contains at minimum: TL;DR, Why, What's changing, Flow, Edge cases, Open Questions, Related context
- [ ] Markdown PRD copy is saved to /mnt/user-data/outputs/ and presented via present_files
- [ ] Completeness checklist (Step 10) was walked through, not skipped
- [ ] PRD's Open Questions section explicitly lists missing assets, undefined states, missing animation specs, and unconfirmed implementation details
- [ ] Final message includes: Figma URL to PRD frame, Figma URL to annotations group, markdown PRD file
