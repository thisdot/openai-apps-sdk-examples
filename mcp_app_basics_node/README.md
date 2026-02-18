# MCP App Basics server (Node)

Educational MCP server with eleven interactive examples covering the core MCP Apps SDK APIs. Each tool renders a widget that demonstrates one API and includes an expandable code walkthrough.

## Prerequisites

- Node 18+
- Static assets built (`pnpm run build` from repo root)

## Install & run

```bash
pnpm install
pnpm start
# or change port: PORT=9000 pnpm start
```

Server listens on `http://localhost:8000/mcp`.

## Examples

### Data Flow

| Tool | API | Try saying in ChatGPT |
|------|-----|-----------------------|
| `show_tool_result` | `ontoolresult` + `structuredContent` | "Show me how a tool result gets displayed in a widget" |
| `send_message` | `app.sendMessage()` | "How do I send a message from a widget?" |
| `update_model_context` | `app.updateModelContext()` | "How can a widget silently give context to the model?" |

### Widget ↔ Server

| Tool | API | Try saying in ChatGPT |
|------|-----|-----------------------|
| `call_server_tool` | `app.callServerTool()` | "Show me how a widget calls a server tool directly" |

### Host Interaction

| Tool | API | Try saying in ChatGPT |
|------|-----|-----------------------|
| `open_link` | `app.openLink()` | "How do I open a link from a widget?" |
| `request_display_mode` | `app.requestDisplayMode()` + `getHostContext()` | "How do I make a widget go fullscreen?" |
| `host_theming` | `useHostStyles()` + `useDocumentTheme()` | "How do I match the host's theme in my widget?" |
| `get_host_capabilities` | `app.getHostCapabilities()` | "How do I check what the host supports?" |
| `get_host_context` | `app.getHostContext()` + `onhostcontextchanged` | "How do I get the host's theme and locale?" |
| `get_host_version` | `app.getHostVersion()` | "How do I identify which host is running?" |

### Tool Lifecycle

| Tool | API | Try saying in ChatGPT |
|------|-----|-----------------------|
| `streaming_tool_input` | `ontoolinputpartial` → `ontoolinput` → `ontoolresult` | "Show me how streaming tool input works" |
