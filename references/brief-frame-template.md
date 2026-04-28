# Handoff Brief Frame Template

The brief is a 480px-wide frame named **"Handoff Brief"** placed on the Figma canvas. The skill creates it in Step 2 and reads it in Step 5.

## Fields (13 total)

| # | Field | What to parse |
|---|-------|--------------|
| 1 | Flow name | Name engineering will use |
| 2 | Designer | Name + handle |
| 3 | Linear ticket | Full URL → skill pulls context |
| 4 | Goal | 1 sentence: user problem → solution → outcome |
| 5 | User trigger | What puts the user in this flow |
| 6 | Scope — what's new | Bullet list of new screens/components/states |
| 7 | Scope — what's changing | Bullet list of modifications |
| 8 | Out of scope | Intentionally not handled |
| 9 | Edge cases to call out | Error/empty/loading states, max content, a11y, localization |
| 10 | Custom assets | Non-DS icons, illustrations, Lottie/Rive files |
| 11 | Data & implementation context | APIs, perf considerations, analytics (optional) |
| 12 | Open questions | Undecided items needing engineering input |
| 13 | Related work | Granola notes, prior designs, Slack threads, research links |

## Parsing rules

- Placeholder text `"— write here —"` = field is empty = treat as Open Question
- If "Goal" says "see Linear ticket" → pull goal from the Linear ticket instead
- If "Related work" contains a `granola.ai` URL → fetch via Granola MCP in Step 7

## Minimum viable brief

If only 3 fields are filled, priority: **Goal** > **Scope — what's new** > **Edge cases**.
