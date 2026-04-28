# Handoff Completeness Checklist

A rubric to run through before declaring a handoff done. Adapted from the generic "handoff-spec" content checklist, filtered for what actually applies to Headout's mobile-first product flows.

Use this as a self-check before generating the PRD (Step 6 of the workflow). For each category, ask: *did the design + brief give us enough to fill this in, or is there a gap?* If there's a gap, it goes in the PRD's Open Questions section — never silently skip.

## Visual specs

- [ ] **Spacing & sizing** — Captured via design system tokens, not raw pixel values. If a screen uses non-token values, that's worth a callout (the team's house rule is to use tokens).
- [ ] **Colors** — Token names referenced, not hex. E.g. `surface/primary`, not `#FFFFFF`.
- [ ] **Typography** — Style name from the type system, not arbitrary size/weight combos.
- [ ] **Border radius, shadows, opacity** — From tokens where applicable.
- [ ] **Responsive behavior** — Mobile is primary; if any tablet/desktop behavior is in scope, note breakpoints.

## Interaction specs

- [ ] **All states for interactive elements** — default, hover (web), pressed/active, focus, disabled. Every button, input, and link.
- [ ] **Transitions and animations** — Each transition has a spec card (Trigger / Feedback / Easing). Pulled from prototype reactions, not invented.
- [ ] **Gestures** — Swipe, drag, pull-to-dismiss explicitly noted where they apply (especially for sheets and carousels).
- [ ] **Keyboard / screen reader** — For accessibility, the brief should flag tab order and any custom ARIA needs.

## Content specs

- [ ] **Character limits & truncation** — Max characters per field; truncation behavior (ellipsis at line N, fade, etc.). Especially important for product names, addresses, and user-generated text.
- [ ] **Dynamic content rules** — What changes based on data; min/max counts (e.g. "shows up to 5 banners, then carousel").
- [ ] **Localization** — Text expansion in DE/FR (German runs ~30% longer), RTL languages if applicable, any hard-coded strings flagged.
- [ ] **Empty / loading / error states** — Each present in design or explicitly noted in brief.

## Assets to extract

- [ ] **Icons** — Custom (non-design-system) icons listed with their Figma node names. Engineers will export as SVG.
- [ ] **Images** — Photos and illustrations with their dimensions and format. Note if responsive variants needed.
- [ ] **Fonts** — Any non-system fonts beyond the team's Inter setup.
- [ ] **Animations / Lottie / Rive** — File names or links to motion assets the design references but doesn't embed.

## Edge cases

- [ ] **Content extremes** — Longest realistic content, shortest realistic content, no content.
- [ ] **Network states** — Offline behavior, slow network, request failure.
- [ ] **Permission states** — Location denied, notifications denied, etc.
- [ ] **Device-specific** — Anything unusual for iOS vs Android, or for older devices.
- [ ] **Accessibility** — Touch target ≥44pt, color contrast meets AA, screen reader labels, dynamic type support.

## Implementation notes

- [ ] **Component reuse** — Which design system components are used as-is vs. modified vs. new. Engineers need to know whether to update shared components or fork.
- [ ] **Data dependencies** — What data this flow needs from APIs (the brief should call this out, even informally).
- [ ] **Performance flags** — Anything with rendering cost (heavy animations, large image loads, infinite scroll, real-time data) gets a flag.
- [ ] **Analytics events** — Which interactions need tracking events (often handled separately, but worth flagging).

## How the skill should use this

After Step 5 (placing annotations) and before Step 6 (writing PRD), walk through this checklist. For each item:

- If the design or brief covers it → include in the PRD section
- If it's clearly N/A → omit silently
- If it should be there but isn't → add to PRD's Open Questions, phrased as a question to the designer

Don't list every checklist item in the PRD itself — that would make the doc bloated. Use this as an internal rubric; the PRD only mentions what's actually relevant to this specific flow.
