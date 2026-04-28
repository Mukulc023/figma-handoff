# Handoff Brief Frame Template

This is the template designers add to the Figma canvas before triggering handoff. It's the single highest-leverage input for the skill — every field saves the skill from having to guess or ask.

## How designers use it

1. Duplicate the template frame from the team's Figma library (or paste the structure below into a new frame)
2. Name the frame exactly **"Handoff Brief"**
3. Place it in the **top-left corner** of the section being handed off
4. Fill in each field — most are 1–2 sentences max
5. Leave fields blank only if truly N/A (don't write "N/A" — just leave empty)

## The template structure

The frame should be 480px wide and contain these labeled text blocks in order:

```
┌─────────────────────────────────────────────────┐
│  HANDOFF BRIEF                                  │
│                                                 │
│  Flow name                                      │
│  [e.g. "Cancellation flow — refund on             │
│   non-cancellable bookings"]                    │
│                                                 │
│  Designer                                       │
│  [name + handle]                                │
│                                                 │
│  Linear ticket                                  │
│  [URL — paste the full link]                    │
│                                                 │
│  Goal                                           │
│  [1 sentence: what user problem does this       │
│   solve, and what's the success metric?]        │
│                                                 │
│  User trigger                                   │
│  [What action or context puts the user in       │
│   this flow? e.g. "User taps 'Cancel booking'   │
│   from booking details"]                        │
│                                                 │
│  Scope — what's new                             │
│  [Bullet list of new screens, components, or    │
│   states. Don't list things that already exist  │
│   in production unchanged.]                     │
│                                                 │
│  Scope — what's changing                        │
│  [Bullet list of existing things being modified.│
│   Be specific about what changes.]              │
│                                                 │
│  Out of scope                                   │
│  [Anything intentionally not handled in this    │
│   handoff — useful so engineering doesn't ask.] │
│                                                 │
│  Edge cases to call out                         │
│  [Things engineering might miss: error states,  │
│   empty states, max content lengths, slow       │
│   networks, accessibility considerations, etc.] │
│                                                 │
│  Custom assets                                  │
│  [Anything beyond the design system: custom     │
│   icons, illustrations, Lottie/Rive files,      │
│   non-standard fonts. Just list names — engi-   │
│   neering will export from Figma.]              │
│                                                 │
│  Data & implementation context                  │
│  [Optional. Anything you know about the data    │
│   this needs (APIs, fields), performance        │
│   considerations, or analytics events.]         │
│                                                 │
│  Open questions                                 │
│  [Anything the designer hasn't decided yet, or  │
│   where engineering input is needed.]           │
│                                                 │
│  Related work                                   │
│  [Links: prior designs, research, Granola       │
│   meeting notes, Slack threads, etc.]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Field-by-field guidance for designers

**Flow name** — Write the name engineering will use. Match the Linear ticket title if there is one.

**Designer** — Slack handle is fine. Engineering will know who to ask if something's unclear.

**Linear ticket** — Full URL. The skill will follow this and pull in the user problem and success metric automatically, so the Goal field below can be brief.

**Goal** — One sentence. Two formats work well:
- "*Reduce X by Y by enabling Z.*"
- "*Let users do X without having to Y.*"
If the Linear ticket already covers this richly, you can write "see Linear ticket" here.

**User trigger** — The "from where" of this flow. Engineering needs this to know what state the app is in when the flow begins.

**Scope — what's new vs. what's changing** — Splitting these helps engineering estimate. New screens take longer than tweaks. Be specific:
- ✅ "New: refund-details bottom sheet shown after reason selection"
- ❌ "New cancellation flow"

**Out of scope** — A two-line list saves an hour of clarification. *"Not handling: refunds on group bookings, partial cancellations, currency conversion."*

**Edge cases to call out** — The most valuable field. Things the design alone doesn't show:
- Error states (network failure, payment decline, validation errors)
- Empty states (no bookings, no pickups available)
- Max content (long product names, long pickup addresses, 8+ banners)
- Loading states and timing
- Accessibility (touch target sizes, screen reader labels, color contrast)
- Localization (text expansion in DE/FR, RTL languages)

**Custom assets** — Quick list of anything that's not from the existing design system. Custom icon names, illustration filenames, Lottie/Rive sources. Engineering exports the rest themselves; this section just makes sure they don't miss the non-standard stuff.

**Data & implementation context** — Optional. If you know which APIs feed this flow, what fields are needed, or have a strong opinion on performance (e.g. *"banners should preload"*, *"infinite scroll, paginate by 20"*), drop it here. Skip if you don't have it — engineering will figure it out.

**Open questions** — Anything you haven't decided. Better to flag now than discover during dev:
- "*Should we use Smart Animate or page transition for the swipesheet?*"
- "*Need to confirm with backend whether refund timing is real or estimated.*"

**Related work** — Anything that gives context. Granola meeting URLs are particularly valuable — the skill can pull these in if the connector is enabled.

## Why this format

- **Predictable structure** = the skill can parse it reliably without complex prompting
- **Short fields** = low friction for designers; takes 5–10 minutes to fill
- **Explicit scope split** = engineering can scope and estimate from the brief alone
- **Open questions captured upfront** = fewer mid-sprint surprises

## Minimum viable brief

If a designer is in a rush and can only fill three fields, the priority order is:

1. **Goal** — without this, the PRD's "why" section is empty
2. **Scope — what's new** — without this, the skill might over- or under-annotate
3. **Edge cases** — without this, the PRD will miss the things devs most need to know

A brief with just these three is usable. A brief with all eleven is great.
