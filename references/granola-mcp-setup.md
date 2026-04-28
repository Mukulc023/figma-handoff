# Granola MCP Server Setup

This skill can pull meeting notes from [Granola](https://granola.ai) when a designer includes a Granola link in the Handoff Brief's "Related work" field.

## Official Granola MCP Server

- **Server URL:** `https://mcp.granola.ai/mcp`
- **Transport:** Streamable HTTP
- **Auth:** OAuth 2.0 (you'll authenticate through Granola's flow on first use)
- **Requirements:** Granola account (Enterprise plan for full access; Free plan limits to last 30 days)

### Claude Code configuration

Add to your Claude Code MCP settings (`.claude/settings.json` or via the Claude Code UI):

```json
{
  "mcpServers": {
    "granola": {
      "url": "https://mcp.granola.ai/mcp"
    }
  }
}
```

On first use, Claude Code will open Granola's OAuth flow for you to authorize access.

### Enterprise users

Enterprise admins must enable MCP access in **Settings > Security** before team members can connect.

## Available tools

Once connected, the Granola MCP server provides:

| Tool | Use case |
|------|----------|
| **List meetings** | Find meetings by date, title, or attendees |
| **Search meetings** | Full-text search across notes, transcripts, and AI summaries |
| **Get meeting notes** | Retrieve notes, summary, and action items for a specific meeting |

## How the skill uses Granola

During **Step 7** of the handoff workflow:

1. The skill checks the brief's "Related work" field for Granola URLs
2. If found, it fetches the meeting notes via the Granola MCP
3. Design decisions, constraints, and action items from the meeting are incorporated into the PRD
4. If the Granola MCP isn't connected, the skill asks the user to paste the relevant notes manually

## Alternative: Community MCP (local, no API needed)

If you prefer a local setup that reads from Granola's cache (no network calls):

```bash
git clone https://github.com/pedramamini/GranolaMCP.git
cd GranolaMCP
pip install -e .
```

Configure in Claude Code:

```json
{
  "mcpServers": {
    "granola": {
      "command": "python",
      "args": ["-m", "granola_mcp"],
      "env": {
        "GRANOLA_CACHE_PATH": "/Users/<username>/Library/Application Support/Granola/cache-v3.json"
      }
    }
  }
}
```

This reads directly from Granola's local cache file — works offline, no Enterprise plan required.
