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

### Connector implementation

**`figma.createConnector()` DOES NOT WORK in design files** — silently creates nothing. Use `figma.createVector()` + `setVectorNetworkAsync()`:

```javascript
const mkElbow = async (fromX, fromY, toX, toY) => {
  const midX = (fromX + toX) / 2;
  const minX = Math.min(fromX, toX), minY = Math.min(fromY, toY);
  const lFx = fromX - minX, lFy = fromY - minY;
  const lTx = toX - minX, lTy = toY - minY;
  const lMx = midX - minX;
  const vec = figma.createVector();
  vec.name = 'Elbow';
  vec.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.75 } }];
  vec.strokeWeight = 2;
  try {
    await vec.setVectorNetworkAsync({
      vertices: [
        { x: lFx, y: lFy, strokeCap: 'NONE' },
        { x: lMx, y: lFy, strokeCap: 'NONE', cornerRadius: 8 },
        { x: lMx, y: lTy, strokeCap: 'NONE', cornerRadius: 8 },
        { x: lTx, y: lTy, strokeCap: 'ARROW_LINES' }
      ],
      segments: [{ start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }],
      regions: []
    });
  } catch (e) {
    const pathData = `M ${lFx} ${lFy} L ${lMx} ${lFy} L ${lMx} ${lTy} L ${lTx} ${lTy}`;
    vec.vectorPaths = [{ windingRule: 'NONE', data: pathData }];
    vec.strokeCap = 'ARROW_LINES';
  }
  vec.x = minX; vec.y = minY;
  pageNode.appendChild(vec);
  return vec;
};
```

- `fromX/Y` = note edge (at vertical center). `toX/Y` = screen anchor (arrow tip lands here)
- `cornerRadius: 8` = rounded bends. `ARROW_LINES` only on last vertex
- No invisible anchor rectangles needed — vectors use absolute coordinates
- After placing all elbows, verify count. 0 elbows = silent failure, investigate

### Placement rules

- Notes in **gutter adjacent to screen** (~60px from edge), not stacked far away
- Left of screen if space left, right if space right
- Min 28px vertical gap between stacked notes

**Anti-overlap algorithm:**

```javascript
let lastNoteBottom = -Infinity;
const NOTE_GAP = 28;
for (const callout of calloutsSortedByAnchorY) {
  const estHeight = estimateNoteHeight(callout.text);
  const desiredY = callout.anchorY - estHeight / 2;
  const actualY = Math.max(desiredY, lastNoteBottom + NOTE_GAP);
  note.y = actualY;
  lastNoteBottom = actualY + estHeight;
}
```

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

Mapping: `transition.type` → animate (SMART_ANIMATE→"Smart animate", PUSH→"Push [dir]", DISSOLVE→"Cross-fade"). `transition.easing.type` → animation-curve. `transition.duration` × 1000 → ms.

Unknown values → `TBD;` + add to PRD Open Questions. Never invent specs.

Anchor connector at trigger point on source screen, not destination.

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
