# Annotation Primitives — Headout House Style

This document is the source of truth for the visual specs and phrasing of each annotation type. It was reverse-engineered from these existing handoffs:
- Cancellation Flow (Booking-details-2025)
- Smart Pickups (Booking-details-2025)
- M-tickets (Headout-Ticket)

If anything in SKILL.md conflicts with this file, this file wins.

## Universal principle: tokens, not raw values

When an annotation references a value (color, spacing, radius, font size), use the design system token name — not the raw hex/pixel value. *"surface/primary"*, not *"#FFFFFF"*. *"spacing/16"*, not *"16px"*. This is the team's house rule and matches how engineering reads the spec. Only use raw values when no token exists for that value (and flag it in the PRD's Open Questions if a token *should* exist).

---

## Primitive 1 — Section Banner

**Purpose:** Group screens by theme. Sits above a horizontal row or cluster of screens.

**Layer signature in existing files:** Frames named "Main Journey" or "Group 1000007XXX" containing a "Frame 2199006" → "Title" → "Title+Subtext" hierarchy.

**Geometry:**
- Outer width: variable (422–917px observed), fits the cluster of screens it sits above
- Outer height: 195px (single line subtext) or 282px (multi-line subtext)
- Inner padding: 32px on all sides
- Inner Title+Subtext frame width = outer width − 64px
- Title text: 36px height
- Subtext text: 87px height (single-line variant) or 174px–333px (multi-line)
- Gap between title and subtext: 8px

**Typography:**
- Title: large, bold, dark
- Subtext: medium, regular weight, slightly muted

**Content style:**
- Title is a noun phrase naming the theme: "M-ticket updates", "Cancellation flow", "Smart Pickups", "Edge cases"
- Subtext describes the specific variant or sub-theme: "Banner on the ticket", "Cancellation Reason selection", "When banner exists", "1/2 open", "Default view"
- For animation-related groupings, subtext often uses gerunds: "Banner entry animation", "swipesheet opening"

**When to use:** Place one above each visually distinct cluster of screens. Don't over-use — if every screen gets its own banner, the structure disappears.

---

## Primitive 2 — Pointer Callout

**Purpose:** Short note pointing at a specific UI element on a screen.

**Visual structure (CRITICAL — this part went wrong on first attempt):**

Each callout is THREE objects working together:

1. **The note frame** — 232px wide, dark fill (`{r:0.13, g:0.13, b:0.16}`), 8px corner radius, 12/14px padding. Auto-layout vertical with 8px spacing.
2. **A category pill** at the top of the note — small colored chip with a category label in 9px Inter Semi Bold, white text. Padding 3/8. 4px radius.
3. **An elbow connector** (`figma.createConnector()` with `connectorLineType = 'ELBOWED'`) connecting an invisible anchor to the note.

Body text below the pill, 12px Inter Regular, near-white color, 145% line-height.

**Categories and colors:**

| Category | When to use | Color (RGB) | Hex |
|----------|-------------|-------------|-----|
| BEHAVIOR | Default — functional behavior, content limits, state rules | `0.12, 0.65, 0.55` | `#1FA68D` |
| INTERACTION | Gestures, taps, transitions between screens | `0.23, 0.51, 0.9` | `#3B82E6` |
| CONTENT | New fields, content rules, copy constraints | `0.51, 0.31, 0.83` | `#8350D4` |
| PHASE | Scope notes — what's in/out of this phase | `0.85, 0.46, 0.04` | `#D9760A` |

If unsure, use BEHAVIOR. Don't invent new categories without team agreement.

**Connector — get this right or the canvas looks chaotic:**

This is the single highest-leverage detail. Long diagonal lines crossing each other = unreadable. Elbow connectors hugging the gutters = clean.

**DO NOT use `figma.createConnector()` in Figma design files.** It silently fails — connectors get created without errors but render as nothing (or as straight lines after grouping breaks endpoint refs). This was confirmed by post-mortem audit: a file with 15 expected connectors had 0 actual `CONNECTOR` nodes. Use manual vector paths instead.

**Use `figma.createVector()` with `setVectorNetworkAsync()`** — this gives you rounded corners at bends and per-end arrow control:

```javascript
const mkElbow = async (fromX, fromY, toX, toY) => {
  const midX = (fromX + toX) / 2;
  const minX = Math.min(fromX, toX);
  const minY = Math.min(fromY, toY);
  const lFx = fromX - minX, lFy = fromY - minY;
  const lTx = toX - minX,   lTy = toY - minY;
  const lMx = midX - minX;

  const vec = figma.createVector();
  vec.name = 'Elbow';
  vec.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.75 } }];
  vec.strokeWeight = 2;

  try {
    await vec.setVectorNetworkAsync({
      vertices: [
        { x: lFx, y: lFy, strokeCap: 'NONE' },                       // start (note edge)
        { x: lMx, y: lFy, strokeCap: 'NONE', cornerRadius: 8 },      // bend 1 (rounded)
        { x: lMx, y: lTy, strokeCap: 'NONE', cornerRadius: 8 },      // bend 2 (rounded)
        { x: lTx, y: lTy, strokeCap: 'ARROW_LINES' }                 // end (anchor) — arrow here only
      ],
      segments: [
        { start: 0, end: 1 },
        { start: 1, end: 2 },
        { start: 2, end: 3 }
      ],
      regions: []
    });
  } catch (e) {
    // Fallback for older API: vectorPaths with sharp corners and arrows on both ends
    const pathData = `M ${lFx} ${lFy} L ${lMx} ${lFy} L ${lMx} ${lTy} L ${lTx} ${lTy}`;
    vec.vectorPaths = [{ windingRule: 'NONE', data: pathData }];
    vec.strokeCap = 'ARROW_LINES';
  }

  vec.x = minX;
  vec.y = minY;
  pageNode.appendChild(vec);
  return vec;
};
```

The key parameters in the call:
- `fromX, fromY` — the **note edge** (right edge of note for left-side notes; left edge for right-side notes), at the note's vertical center
- `toX, toY` — the **screen anchor** (where the arrow tip should land)
- The midpoint X creates the elbow column halfway between them
- `cornerRadius: 8` on the bend vertices makes the corners rounded
- `strokeCap: 'ARROW_LINES'` only on the last vertex puts the arrowhead at the screen end, not the note end

**No invisible anchor rectangles needed.** The vector node uses absolute coordinates directly — much cleaner than the connector + anchor pattern. The arrow tip lands wherever you specify `toX, toY`.

**Verifying it worked:** the function returns the vector node. After all elbows are placed, log how many were created with `vectorNetwork` vs `vectorPaths` fallback. If a run silently creates zero elbows, something's broken — the rebuild attempt should fail loudly, not silently.

**Note placement — also critical:**

Notes go in the **empty gutter immediately adjacent to the screen they annotate**, not stacked far away on one side. Specifically:

- For a screen with empty space to its left → notes go left, in a column ~60px from the screen edge
- For a screen with empty space to its right → notes go right, in a column ~60px from the screen edge
- For a long scrolling screen with many anchors close together (e.g. < note-height apart), stack notes vertically and let elbow connectors handle the routing — but maintain a minimum 28px gap between notes vertically to avoid overlap

**Anti-overlap algorithm** (use this every time you stack callouts on a long screen):

```javascript
let lastNoteBottom = -Infinity;
const NOTE_GAP = 28;
for (const callout of calloutsSortedByAnchorY) {
  const estHeight = estimateNoteHeight(callout.text); // pill + body lines
  const desiredY = callout.anchorY - estHeight / 2;   // align note mid with anchor
  const actualY = Math.max(desiredY, lastNoteBottom + NOTE_GAP);
  note.y = actualY;
  lastNoteBottom = actualY + estHeight;
}
```

This keeps notes close to their anchors when there's room, and stacks them down cleanly when there isn't. The elbow connector absorbs the resulting offset.

**Content style — this is the distinctive Headout voice:**
- ALWAYS lowercase (even at the start of the sentence — this is intentional)
- Conversational and slightly informal
- Under 15 words, ideally 8–12
- Often starts with "in case…", "when…", "the…", "use…", "we…"

**Examples from existing handoffs:**
- "in case more than 2 banners exist on on ticket,. we add carousel dots"
- "in case the content flows into 2 lines, we keep the icon top aligned"
- "when the banner comes, the content on the page is pushed down"
- "in case there is a important info section, we change the bg colour to grey"
- "the copy is final"
- "use the illustration frame as placeholders, we will be adding rive animation for all banners"
- "we should always open the section based on the banner the user clicked"
- "in case the banner content goes in 2 lines, we truncate it"
- "to close the sheet, the user can click on the CTAS, pull the sheet down or tap outside"

Note: typos and minor grammar quirks in the originals (e.g. "on on ticket,. we add") are part of the casual register — don't be more formal than the team. But also don't introduce *new* typos; clean is fine, just don't be stiff.

**When to use:** Any UI element that's new, different, or where engineering needs to know specific behavior. Anchor the connector to the actual node ID where possible (or to an invisible anchor at the precise coordinate), not just to the screen as a whole — a connector pointing at the entire screen is useless.

---

## Primitive 3 — Interaction Note Card

**Purpose:** Document an interaction or transition with the three properties engineering always needs: what happens, when it happens, and the animation/timing spec. This is the team's standard for any UX behavior that involves motion or a non-trivial state change.

**Visual structure (CRITICAL — and different from a pointer callout):**

This primitive is TWO objects:

1. **A small caption ABOVE the card** — plain text, "Interaction notes" in 11px Inter Regular, muted gray. Sits 6px above the card.
2. **The card itself** — light blue fill (`{r:0.89, g:0.95, b:0.99}`), blue border (`{r:0.18, g:0.55, b:0.82}`, 1.5px), 4px corner radius, 16/18 padding. Auto-layout vertical with 12px spacing.

Inside the card, three text blocks in this exact order:

```
[Interaction notes]                  ← caption ABOVE the card, not inside

┌─────────────────────────────────┐  ← light-blue card with blue border
│ Title                           │  ← 16px Inter Semi Bold, dark text
│                                 │
│ One-sentence description of     │  ← 13px Inter Regular, dark text, 145% line-height
│ what happens.                   │
│                                 │
│ animate: Smart animate;         │  ← 12px, slight blue tint, 165% line-height
│ animation-curve: 0.7,0,0.3,1    │     spec block — CSS-like name: value;
│ animation-duration: 500ms;      │
└─────────────────────────────────┘
```

**Card width:** 280px is the team's standard. Don't widen — the card is meant to be scannable, not a paragraph.

**The spec block format:**

Each line is `name: value;` style, mirroring CSS so engineering can map it directly. Use the exact property names the team uses:

- `animate: Smart animate;` (or `Push left;`, `Cross-fade;`, `Dissolve;`)
- `animation-curve: ease-in-out;` or `animation-curve: 0.7, 0, 0.3, 1` (custom bezier — note: comma-separated, no parens around the values)
- `animation-duration: 500ms;`

For non-animation properties (e.g. audio preview length, sync rules), keep the same shape:
- `snippet length: 30–60s;`
- `audio: compressed, streamable;`
- `sync: tapping list item highlights pin & vice versa;`

**TBD specs:** When the prototype reaction has no Smart Animate properties set (or MCP can't read them), write `TBD;` for the unknown values rather than inventing them — and add the unknown to the PRD's Open Questions:

```
animate: Smart animate;
animation-curve: TBD;
animation-duration: TBD;
```

**Connecting to a UI element:**

Like pointer callouts, anchor via an invisible 2×2 anchor rectangle and an ELBOWED connector. Anchor at the trigger point on the source screen (e.g. the button being tapped), not at the destination.

**Auto-extraction from Figma:**

When prototype reactions are readable, pull from `reactions[].action.transition`:
- `transition.type` → `animate:` value (SMART_ANIMATE → "Smart animate", PUSH → "Push [direction]", DISSOLVE → "Cross-fade")
- `transition.easing.type` → `animation-curve:` (EASE_IN_OUT, CUSTOM_CUBIC_BEZIER with control points, etc.)
- `transition.duration` (in seconds, multiply by 1000) → `animation-duration:` in ms

**When to use:** Any transition between screens, any animation on a single screen, any non-trivial interaction that has timing or motion (audio play/pause, expand/collapse, drag-to-dismiss). If it moves or has a duration, it's an Interaction Note.

---

## Primitive 4 — Notes Sticky

**Purpose:** Collect general behavioral notes, dependencies, and dev-relevant facts that don't anchor to a specific UI element. The "stuff the dev needs to know but isn't pointing at any one button."

**Visual structure:**

A single cream/yellow sticky-style frame with a heading and a numbered list. No connector — it doesn't point at anything specific.

- Background: `{r:0.98, g:0.96, b:0.85}` (warm cream)
- Width: 380–460px depending on content volume
- Corner radius: 4px
- Padding: 22 top/bottom, 24 left/right
- Heading: 16px Inter Semi Bold, dark text, "Notes" (or a more specific heading like "Dev notes", "Backend dependencies")
- Body: numbered list, 13px Inter Regular, dark text, 155% line-height. Items separated by a blank line for readability.

**Content style:**

- Each item is one self-contained statement
- Slightly more formal than pointer callouts (because this is a doc-like note, not an arrow-pointing callout)
- No category pills (unlike pointer callouts)
- Hyperlinks are allowed for references (e.g. links to backend specs, Linear tickets, Slack threads) — render in blue with underline on the relevant range using `setRangeFills` and `setRangeTextDecoration`

**Examples:**

> 1. Tour cannot be published without all 4 highlights selected (mandatory in studio).
> 2. Tour name display gets a new "age maturity" field. Studio backend gets a new "studio" field.
> 3. Audio compression required for preview snippets — streamable for quick loading.
> 4. Backend spec sheet required for media team coordination before dev kickoff.
> 5. Rive animations referenced in handoff thread — pull source files from there.

**Placement:**

Place in an open area near (but not touching) the screens — top-right corner of the section, or below all screens. Wide enough to read comfortably without scrolling sideways.

**When to use over pointer callouts:**

- 3+ related notes that share a theme (e.g. "Backend dependencies", "Phase boundaries", "Asset notes")
- Notes that don't anchor to any single UI element
- Reference info (links, file paths, dependencies)

If you find yourself making more than 6 pointer callouts on one screen, consider consolidating some into a Notes sticky — it's easier to scan as a list.

---

## Primitive 5 — Trigger Label

**Purpose:** Plain-text label on a flow connector indicating WHAT user action causes a transition between screens. Lighter weight than a Flow Connector (Primitive 6 below) — used inside an interaction context, not as a section-level flow marker.

**Visual structure:**

- No card or background — just text floating on the canvas
- 13–14px Inter Regular, white/light text on dark canvas (or dark text on light)
- Connected via an ELBOWED connector to the trigger element on the source screen
- Sentence-case, descriptive phrasing: *"If the user taps on the card of the 'Know more' CTA"*, *"On scroll past the highlights section"*, *"After 1200ms delay"*

**Difference from Flow Connector (Primitive 6):**

| | Trigger Label (this primitive) | Flow Connector (Primitive 6) |
|---|---|---|
| Style | Plain text, sentence case | ALL CAPS bold |
| Used for | Specific element-level triggers within a flow | Major between-screen transitions |
| Has card | No | No |
| Connected | Elbow connector to UI element | Inline on the arrow between screens |

Use Trigger Labels when annotating *what causes* an interaction; use Flow Connectors when labeling the *path* between two screens.

---

## Primitive 6 — Flow Connector

**Purpose:** Label a transition arrow between screens with the user action that triggers it.

**Layer signature in existing files:** ALL CAPS text nodes positioned along arrow paths between screens, often inside "Group 1000008XXX" frames.

**Geometry:**
- The text sits along an arrow line that goes from one screen to another
- Text is positioned roughly at the midpoint of the arrow

**Typography:**
- Bold, ALL CAPS
- Smaller than other annotation types (label-sized)

**Content style:**
- ALL CAPS
- Action-oriented, describes what the user does to trigger the transition
- Typically starts with a gerund or imperative: "SELECTING…", "TAPPING…", "DIRECTLY TAKE TO…"
- Use straight quotes inside the label (e.g. SELECTING "PROCEED TO CANCEL" BUTTON), not curly quotes

**Examples from existing handoffs:**
- SELECTING "PROCEED TO CANCEL" BUTTON
- DIRECTLY TAKE TO THE REFUND DETAILS SCREEN
- (Cancellation flow uses these between screen variants and outcomes)

**Auto-extraction:** Pull from prototype reactions — `reaction.trigger.type` (TAP, HOVER, etc.) plus the source node's name (e.g. button label) gives you what you need. Convert to ALL CAPS and Headout phrasing.

---

## Decision tree — which primitive to use

```
Is it grouping multiple screens by theme?              → Primitive 1: Section Banner
Is it pointing at one UI element with a short note?    → Primitive 2: Pointer Callout
Is it about a transition / animation / interaction?    → Primitive 3: Interaction Note Card
Is it 3+ general notes that don't anchor to anything?  → Primitive 4: Notes Sticky
Is it labeling what user action triggers something?    → Primitive 5: Trigger Label
Is it labeling the path between two screens?           → Primitive 6: Flow Connector
```

## When to use multiple primitives together

A typical screen handoff looks like:

- **1 Section Banner** above the screen
- **2–6 Pointer Callouts** for short UI-element-level notes
- **1–4 Interaction Note Cards** for transitions and animations
- **0–1 Notes Sticky** for general behavioral/dependency notes that span the whole screen
- **Trigger Labels** on flow arrows where a specific user action causes the next screen
- **Flow Connectors** between screen clusters for major flow paths

Don't use every primitive on every screen — pick what the content needs. A purely informational screen might only need a Section Banner + Pointer Callouts. A screen that's an interactive overlay might need a Section Banner + Interaction Note Card + a Trigger Label.
