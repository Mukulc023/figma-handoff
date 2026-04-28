# PRD Output Template

This is the structure for the PRD the skill generates and saves to `/mnt/user-data/outputs/[flow-name]-PRD.md`.

The PRD's job: let an engineer who hasn't seen the Figma file understand what they're building, why, and what to watch out for. Engineers prefer scannable docs — bullet lists, tables, and short paragraphs are appropriate here (unlike most chat responses).

## File naming

`[flow-name-kebab-case]-PRD.md`

Examples: `cancellation-flow-PRD.md`, `m-tickets-banner-update-PRD.md`, `smart-pickups-PRD.md`

## Document structure

```markdown
# [Flow name] — PRD

**Designer:** [name]
**Date:** [YYYY-MM-DD]
**Linear ticket:** [URL]
**Figma file:** [URL with annotations layer selected]
**Status:** Ready for engineering

---

## TL;DR

[2-3 sentence summary. What's changing, who it affects, and the expected impact.
This is what engineering reads first. If they only read this, they should know
whether they need to read more.]

---

## Why

[Pull from Linear ticket if available, or the brief frame's "Goal" field.
Frame this as: user problem → solution approach → expected outcome.

If a Linear ticket is linked, it's fine to link to it for the full context and
keep this section to 2-3 sentences. If no ticket, this section needs to stand
on its own.]

---

## What's changing

### New
[Bullet list from brief's "Scope — what's new". Each bullet should reference
the screen or component name as it appears in Figma so engineering can find it.]

### Modified
[Bullet list from brief's "Scope — what's changing". For each, briefly note
what's different from current production behavior.]

### Out of scope
[Bullet list from brief. This is the "we are intentionally not doing" list —
it prevents scope creep and clarifying questions.]

---

## Flow

[A short walkthrough of the user journey. Use this format:

1. User taps **[Element]** on **[Screen]**
2. **[Screen]** appears with [transition type — e.g. "Smart Animate, 300ms ease-in-out"]
3. User selects **[Option]** → **[Next Screen]**
...

This mirrors the flow connectors placed on the Figma file. If the flow has
branches (different paths based on user choice), use sub-lists or a short table.]

---

## Screens

[For each screen in the flow, a short paragraph or table row:

| Screen name | Purpose | Notable |
|-------------|---------|---------|
| Cancellation Reason selection | User picks why they're cancelling | New: dynamic reason list based on time-to-experience |
| Refund details | Shows refund amount and timing | Modified: added refund-method selector |
| ...

Or as paragraphs if there's more to say per screen.]

---

## Animations & transitions

[Pulled directly from the animation spec cards on the Figma file. One row per
animation:

| Animation | Trigger | Feedback | Easing | Duration |
|-----------|---------|----------|--------|----------|
| Banner entry | 1200ms after page load | Slides from below header | ease-in-out | 300ms |
| Swipesheet open | Tap on banner | Sheet slides up | custom-bezier(0.7,0,0.3,1) | 300ms |
| ...

If any animation in the file lacks specs, list it here with "TBD" and add it
to Open Questions below.]

---

## States

[For interactive elements, list the states explicitly. This is the section
engineers most often ask about that designs alone don't show clearly.

| Element | States covered | Notes |
|---------|---------------|-------|
| Cancel CTA | Default, pressed, disabled, loading | Disabled when no reason selected |
| Reason chip | Default, selected, disabled | Single-select |
| Refund details bottom sheet | Closed, opening, open, dismissing | Pull-to-dismiss enabled |
| ...

If a state is shown in the Figma file, reference its frame name. If it's
defined only in copy/spec and not designed, mark it [TBD design] in Open
Questions.]

---

## Assets to extract

[List the design assets engineers need to pull from Figma. Engineers will
export these themselves via Dev Mode — this section just inventories what to
look for.

### Icons (custom, non-design-system)
| Icon | Figma node | Format |
|------|-----------|--------|
| Refund clock | RefundIcon-clock | SVG |
| ...

### Images / illustrations
| Asset | Figma node | Notes |
|-------|-----------|-------|
| Cancellation success illustration | CancelSuccess-illo | Has @1x, @2x, @3x variants |
| ...

### Motion assets (Lottie / Rive)
| Asset | Source file | Trigger |
|-------|------------|---------|
| Banner entry animation | rive/banner-entry.riv | Page load + 1200ms |
| ...

Skip subsections that are empty for this flow.]

---

## Edge cases

[From brief's "Edge cases" field plus anything the skill detected from
the design (e.g. error variants visible on canvas).

Use sub-headings for clarity:

### Content extremes
- Product name longer than 1 line → truncate with ellipsis
- More than 2 banners → carousel with dots
- No active bookings → empty state shows [content]

### Network states
- Submit cancellation → network failure: [behavior]
- Slow network during sheet open: [behavior]

### Localization
- DE/FR text expansion: button labels may grow ~30%; verify two-line wrap is acceptable
- RTL: [if in scope, behavior; otherwise note out of scope]

### Accessibility
- All tap targets meet 44×44pt minimum
- Banner color contrast verified for AA
- Screen reader: [any custom labels needed]
- Dynamic type support: [behavior at largest size]

Skip any sub-heading that's not relevant to this flow — better tight than padded.]

---

## Component changes

[If the flow modifies design system components (vs. just composing existing
ones), list them here with the change. Engineering needs to know whether to
update the shared component or fork it.

| Component | Change | Treat as |
|-----------|--------|----------|
| Notification Bar | New "long queue" variant | DS update |
| Bottom Ticket | None — used as-is | Reuse |
| ...]

---

## Implementation notes

[A short section for things engineers should know that don't fit elsewhere.
Skip if there's nothing material.

- **Component reuse**: [Which design system components are reused as-is]
- **Data dependencies**: [APIs or data this flow depends on]
- **Performance flags**: [Anything with rendering cost — heavy animations, large images, infinite scroll, real-time data]
- **Analytics events**: [Interactions that should fire tracking events, if known]

If the brief was thin and you don't have detail on these, omit and note it
in Open Questions.]

---

## Open questions

[From brief's "Open questions" field plus anything the skill couldn't determine
(e.g. transitions without prototype connections, missing animation specs).
Format as a numbered list so they're easy to reference in Slack:

1. Should the swipesheet use Smart Animate or a custom page transition?
2. [TBD — designer to confirm] Refund timing copy: "1-3 business days" or
   "up to 5 business days"?
3. [Skill detected] Screen "Tickets are ready, low lead time" has no prototype
   reactions — is this a dead-end or is the connection missing?
4. ...]

---

## Related context

[Links from brief's "Related work" field plus anything the skill found via
connectors:

- Linear ticket: [URL]
- Granola meeting (design review): [URL]
- Prior version (deprecated): [Figma URL]
- Research: [link]
- Slack thread: [link]]

---

## Annotations on Figma

The Figma file has been annotated on the layer **"Handoff Annotations [YYYY-MM-DD]"**.
That layer contains [N] callouts, [N] animation specs, [N] section banners, and
[N] flow connectors. To hide all annotations and view the clean designs, toggle
the layer's visibility.

[Direct link to the file with the annotations layer focused.]
```

## Tone and writing style for the PRD

- Lead with information, not preamble. No "*This document outlines…*" or "*The purpose of this PRD is to…*".
- Short sentences. Active voice. Engineering reads fast.
- When referring to Figma elements, use **bold** for screen names and component names.
- Link, don't quote. If something is in the Linear ticket, link to it instead of restating it.
- Don't apologize for missing info. If something's unknown, put it in Open Questions cleanly.

## Sections to omit when not applicable

- **Component changes** — skip entirely if no design system components are touched
- **Animations & transitions** — skip if the flow has no animations (rare but possible)
- **Assets to extract** — skip if everything is from the design system with no custom assets
- **Implementation notes** — skip if the brief was thin and you have nothing concrete
- **Related context** — skip if the brief had no Related Work field filled

Better a tight PRD than padding.
