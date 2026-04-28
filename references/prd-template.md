# PRD Output Template

File: `[flow-name-kebab-case]-PRD.md`. Let an engineer understand what they're building, why, and what to watch out for — without opening Figma.

## Structure

```markdown
# [Flow name] — PRD

**Designer:** [name] | **Date:** [YYYY-MM-DD] | **Linear:** [URL] | **Figma:** [URL] | **Status:** Ready for engineering

---

## TL;DR
[2-3 sentences: what's changing, who it affects, expected impact.]

## Why
[From Linear ticket or brief's Goal. User problem → solution → outcome. Link to ticket if detailed.]

## What's changing

### New
[Bullets from "Scope — what's new". Reference Figma screen/component names.]

### Modified
[Bullets from "Scope — what's changing". Note what differs from production.]

### Out of scope
[From brief. Prevents scope creep.]

## Flow
[Numbered walkthrough:
1. User taps **[Element]** on **[Screen]**
2. **[Screen]** appears with [transition, e.g. "Smart Animate, 300ms ease-in-out"]
Branches → sub-lists or table.]

## Screens
[Table: Screen name | Purpose | Notable]

## Animations & transitions
[Table: Animation | Trigger | Feedback | Easing | Duration. TBD → Open Questions.]

## States
[Table: Element | States covered | Notes]

## Assets to extract
[Sub-tables for Icons, Images, Motion assets. Skip empty subsections.]

## Edge cases
[Sub-headings: Content extremes, Network states, Localization, Accessibility. Skip irrelevant ones.]

## Component changes
[Table: Component | Change | Treat as (DS update / Reuse / Fork). Skip if none.]

## Implementation notes
[Component reuse, data dependencies, performance flags, analytics. Skip if thin brief.]

## Open questions
[Numbered list: brief's open questions + skill-detected gaps (missing specs, unconnected screens).]

## Related context
[Links: Linear, Granola, prior designs, research, Slack.]

## Annotations on Figma
[Layer name, counts, direct link.]
```

## Style rules

- Lead with info, no preamble ("This document outlines…")
- Short sentences, active voice. **Bold** for screen/component names
- Link, don't quote. Unknown → Open Questions, no apologies

## Omit when N/A

Component changes, Animations, Assets, Implementation notes, Related context — skip entirely if empty. Better tight than padded.
