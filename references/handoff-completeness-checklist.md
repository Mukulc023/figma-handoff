# Handoff Completeness Checklist

Run before generating PRD (Step 10). For each item: covered → PRD, N/A → skip, gap → PRD Open Questions. Never silently skip gaps. Don't list every item in PRD — only what's relevant.

## Visual specs
- [ ] Spacing & sizing via design system tokens (not raw px — flag non-token values)
- [ ] Colors as token names (`surface/primary`, not `#FFFFFF`)
- [ ] Typography from type system (not arbitrary size/weight)
- [ ] Border radius, shadows, opacity from tokens
- [ ] Responsive behavior (mobile primary; note breakpoints if tablet/desktop in scope)

## Interaction specs
- [ ] All states: default, hover (web), pressed, focus, disabled — every button/input/link
- [ ] Transitions & animations: each has spec card (from prototype reactions, not invented)
- [ ] Gestures: swipe, drag, pull-to-dismiss (especially sheets/carousels)
- [ ] Keyboard/screen reader: tab order, custom ARIA needs

## Content specs
- [ ] Character limits & truncation behavior
- [ ] Dynamic content rules: min/max counts, conditional display
- [ ] Localization: DE/FR text expansion (~30%), RTL, hard-coded strings
- [ ] Empty / loading / error states present or noted

## Assets
- [ ] Custom icons (non-DS) with Figma node names
- [ ] Images with dimensions/format, responsive variants
- [ ] Non-system fonts
- [ ] Lottie / Rive file names or links

## Edge cases
- [ ] Content extremes (longest, shortest, none)
- [ ] Network states (offline, slow, failure)
- [ ] Permission states (location/notifications denied)
- [ ] Device-specific (iOS vs Android, older devices)
- [ ] Accessibility: touch target ≥44pt, contrast AA, screen reader labels, dynamic type

## Implementation
- [ ] Component reuse vs. modified vs. new (update shared or fork?)
- [ ] Data dependencies (APIs, fields needed)
- [ ] Performance flags (heavy animations, large images, infinite scroll, real-time)
- [ ] Analytics events to track
