# Annotation Primitives — Headout House Style

Source of truth for visual specs. If SKILL.md conflicts, this file wins.

**Universal rule:** Use design system token names (`surface/primary`, `spacing/16`), not raw hex/pixel. Flag missing tokens in PRD Open Questions.

---

## Primitive 1 — Section Banner

Groups screens by theme. Sits above a screen cluster.

**Specs:** Width variable (422–917px, fits cluster). Height 195px (1-line) or 282px (multi-line). Padding 32px. Title/subtext gap 8px. Title: large bold dark. Subtext: medium regular muted.

**Content:** Title = noun phrase ("M-ticket updates", "Cancellation flow"). Subtext = variant/sub-theme ("Banner entry animation", "When banner exists").

Place one per visually distinct cluster. Don't over-use.

---

## Primitive 2 — Pointer Callout

Short note pointing at a specific UI element. THREE objects:

1. **Note frame** — 232px wide, dark fill `{r:0.13, g:0.13, b:0.16}`, 8px radius, 12/14px padding, auto-layout vertical 8px spacing
2. **Category pill** — 9px Inter Semi Bold white, padding 3/8, 4px radius
3. **Elbow connector** — vector path connecting note to screen element

Body: 12px Inter Regular, near-white, 145% line-height.

**Categories:**

| Category | Use | RGB | Hex |
|----------|-----|-----|-----|
| BEHAVIOR | Default — behavior, limits, state rules | `0.12, 0.65, 0.55` | `#1FA68D` |
| INTERACTION | Gestures, taps, transitions | `0.23, 0.51, 0.9` | `#3B82E6` |
| CONTENT | Fields, content rules, copy | `0.51, 0.31, 0.83` | `#8350D4` |
| PHASE | Scope in/out | `0.85, 0.46, 0.04` | `#D9760A` |

### Placement & side selection

**First, decide which side of the screen composition ALL annotations go on.** Don't mix left and right — pick one side per screen:

1. Check what's to the left and right of the screen frame
2. If the screen is the **leftmost** in a row → annotations go **left**
3. If the screen is the **rightmost** in a row → annotations go **right**
4. If screens are in a single column or there's more space on one side → pick the side with more empty canvas
5. **All annotations for one screen go on the same side** — callouts, interaction cards, everything

**Note column placement:**
- The note column sits **60px from the screen edge** on the chosen side
- All notes in that column are **left-aligned** (if right of screen) or **right-aligned** (if left of screen)
- Note width is fixed at 232px

**Vertical positioning — anchor each note to its target UI element:**
- Each note's vertical center aligns with the Y-center of the UI element it annotates
- If notes would overlap, push them apart using the anti-overlap algorithm below

**Anti-overlap algorithm:**

```javascript
const NOTE_W = 232;
const GUTTER = 60; // gap between screen edge and note column
const NOTE_GAP = 28; // min vertical gap between notes

// Decide side: 'left' or 'right'
const side = screenIsLeftmost ? 'left' : 'right';
const noteColumnX = side === 'right'
  ? screenBbox.x + screenBbox.width + GUTTER
  : screenBbox.x - GUTTER - NOTE_W;

// Sort callouts by the Y position of their target UI element
const sorted = callouts.sort((a, b) => a.anchorY - b.anchorY);

let lastNoteBottom = -Infinity;
for (const callout of sorted) {
  const estHeight = estimateNoteHeight(callout.text);
  const desiredY = callout.anchorY - estHeight / 2; // center-align with anchor
  const actualY = Math.max(desiredY, lastNoteBottom + NOTE_GAP);
  callout.noteX = noteColumnX;
  callout.noteY = actualY;
  lastNoteBottom = actualY + estHeight;
}
```

### Connector implementation

**`figma.createConnector()` DOES NOT WORK in design files** — silently creates nothing. Use `figma.createVector()` + `setVectorNetworkAsync()`.

The elbow connector makes an **L-shaped path**: horizontal from the note edge, then vertical to the anchor Y, then horizontal into the UI element. The bend hugs the gutter — it does NOT cut diagonally across the canvas.

```javascript
// side: 'left' or 'right'
// noteX, noteY, noteW, noteH: note frame bounds
// anchorX, anchorY: exact point on the UI element the arrow should touch
const mkElbow = async (noteX, noteY, noteW, noteH, anchorX, anchorY, side) => {
  // Start point: edge of note, at note's vertical center
  const fromX = side === 'right' ? noteX : noteX + noteW;
  const fromY = noteY + noteH / 2;
  // End point: the UI element
  const toX = anchorX;
  const toY = anchorY;
  // Bend column: 20px from the screen edge (between note and screen)
  const bendX = side === 'right'
    ? noteX - 20        // left of the note column
    : noteX + noteW + 20; // right of the note column

  // Normalize to local coordinates (vector bbox starts at 0,0)
  const minX = Math.min(fromX, toX, bendX);
  const minY = Math.min(fromY, toY);
  const lFx = fromX - minX, lFy = fromY - minY;
  const lBx = bendX - minX, lBy_from = fromY - minY, lBy_to = toY - minY;
  const lTx = toX - minX, lTy = toY - minY;

  const vec = figma.createVector();
  vec.name = 'Elbow';
  vec.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.75 } }];
  vec.strokeWeight = 1.5;

  try {
    await vec.setVectorNetworkAsync({
      vertices: [
        { x: lFx, y: lFy, strokeCap: 'NONE' },                   // note edge
        { x: lBx, y: lFy, strokeCap: 'NONE', cornerRadius: 6 },  // bend 1
        { x: lBx, y: lTy, strokeCap: 'NONE', cornerRadius: 6 },  // bend 2
        { x: lTx, y: lTy, strokeCap: 'ARROW_LINES' }             // arrow tip at UI element
      ],
      segments: [
        { start: 0, end: 1 },
        { start: 1, end: 2 },
        { start: 2, end: 3 }
      ],
      regions: []
    });
  } catch (e) {
    // Fallback: sharp corners
    const d = `M ${lFx} ${lFy} L ${lBx} ${lFy} L ${lBx} ${lTy} L ${lTx} ${lTy}`;
    vec.vectorPaths = [{ windingRule: 'NONE', data: d }];
    vec.strokeCap = 'ARROW_LINES';
  }

  vec.x = minX;
  vec.y = minY;
  pageNode.appendChild(vec);
  return vec;
};
```

**Key points:**
- `fromX/Y` = note edge at vertical center (right edge if notes are left of screen, left edge if right)
- `bendX` = a consistent vertical channel 20px from the note column — all elbows route through this channel so lines stay parallel and clean
- `toX/Y` = exact point on the UI element (use element's absoluteBoundingBox center, or left/right edge depending on side)
- `cornerRadius: 6` = subtle rounded bends
- `strokeWeight: 1.5` = thin, doesn't compete with the design
- `ARROW_LINES` only on the last vertex — arrowhead points at the UI element, not the note
- After placing all elbows, **verify count**. 0 elbows = silent failure, investigate

### Content style (Headout voice)

- ALWAYS lowercase, conversational, <15 words (ideally 8–12)
- Starts with "in case…", "when…", "the…", "use…", "we…"
- Examples: *"in case the banner content goes in 2 lines, we truncate it"*, *"when the banner comes, the content on the page is pushed down"*, *"to close the sheet, the user can click on the CTAS, pull the sheet down or tap outside"*
- Match the team's casual register — clean but not stiff

---

## Primitive 3 — Interaction Note Card

Documents transitions/animations. TWO objects:

1. **Caption** above card — "Interaction notes", 11px Inter Regular, muted gray, 6px above card
2. **Card** — light blue fill `{r:0.89, g:0.95, b:0.99}`, blue border `{r:0.18, g:0.55, b:0.82}` 1.5px, 4px radius, 16/18 padding, auto-layout vertical 12px spacing, **280px wide**

Card contents (in order):
- Title: 16px Inter Semi Bold, dark
- Description: 13px Inter Regular, dark, 145% line-height
- Spec block: 12px, slight blue tint, 165% line-height

**Spec block format** (CSS-like `name: value;`):
```
animate: Smart animate;
animation-curve: ease-in-out;
animation-duration: 500ms;
```

**Always extract specs via Plugin API** — see `references/animation-extraction-snippet.md`. Run the snippet on each screen to get trigger, transition type, easing, and duration directly from prototype reactions. Map using the tables in that file.

Never write `TBD` if the Plugin API is accessible. If a reaction exists but has `transition: null` or `INSTANT`, write `animate: Instant (no transition);`. Only if the Plugin API call itself fails should you ask the user for specs.

Anchor connector at trigger point on source screen, not destination.

**Placement — same side and column as Pointer Callouts for that screen:**
- Interaction cards go in the **same annotation column** as pointer callouts (same side, same 60px gutter)
- They are interleaved with callouts in the vertical stack, sorted by anchor Y-position alongside all other annotations for that screen
- Each card's vertical center aligns with the Y-center of its trigger UI element
- Use the **same anti-overlap algorithm** and **same `mkElbow` connector** as Pointer Callouts (Primitive 2)
- If the card describes a screen-to-screen transition, anchor it to the trigger element on the source screen
- Card width is 280px (wider than callouts) — the note column accommodates whichever is wider

Use for: any transition, animation, motion, or interaction with timing/duration.

---

## Primitive 4 — Notes Sticky

General notes not anchored to a specific element. No connector.

**Specs:** Cream fill `{r:0.98, g:0.96, b:0.85}`, 380–460px wide, 4px radius, padding 22/24. Heading: 16px Inter Semi Bold. Body: numbered list, 13px Inter Regular, 155% line-height. Hyperlinks allowed (blue + underline via `setRangeFills`/`setRangeTextDecoration`).

Place in open area near screens (top-right or below). Use when: 3+ related notes, notes not anchored to UI, reference info. Consider consolidating if >6 callouts on one screen.

---

## Primitive 5 — Trigger Label

Plain text label on flow connector — what user action causes a transition. No card/background.

13–14px Inter Regular. Sentence-case. Connected via elbow to trigger element. E.g. *"If the user taps on the 'Know more' CTA"*, *"After 1200ms delay"*.

vs. Flow Connector: Trigger Label = element-level, sentence case. Flow Connector = screen-level, ALL CAPS.

---

## Primitive 6 — Flow Connector

ALL CAPS label on arrow between screens. Bold, label-sized. Positioned at arrow midpoint.

Action-oriented: *"SELECTING 'PROCEED TO CANCEL' BUTTON"*, *"DIRECTLY TAKE TO THE REFUND DETAILS SCREEN"*. Straight quotes, not curly.

Auto-extract from `reaction.trigger.type` + source node name → ALL CAPS.

---

## Decision tree

```
Grouping screens by theme?                    → 1: Section Banner
Pointing at one element with short note?      → 2: Pointer Callout
Transition / animation / interaction?         → 3: Interaction Note Card
3+ general notes, no specific anchor?         → 4: Notes Sticky
Labeling what action triggers something?      → 5: Trigger Label
Labeling path between screens?                → 6: Flow Connector
```

**Typical screen:** 1 banner + 2–6 callouts + 1–4 interaction cards + 0–1 sticky + trigger labels + flow connectors. Pick what content needs — don't use every primitive on every screen.
