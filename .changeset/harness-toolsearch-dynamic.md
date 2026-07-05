---
'@ai-sdk/harness': patch
'@ai-sdk/harness-claude-code': patch
---

fix(harness): stop surfacing Claude Code's native ToolSearch calls as invalid tool calls

The Claude Code CLI ships a native `ToolSearch` tool (deferred MCP tool loading, on by default for models that support tool search) that was missing from the adapter's built-in tool declarations, so every `ToolSearch` call was flagged `invalid` with a `NoSuchToolError` — and fired `toUIMessageStream`'s `onError` — on otherwise healthy turns. `ToolSearch` is now declared as a Claude Code built-in tool, and `@ai-sdk/harness` additionally degrades unknown *provider-executed* tool calls to dynamic tool calls instead of invalid ones, so future runtime-native tools shipped ahead of the adapters no longer surface as errors.
