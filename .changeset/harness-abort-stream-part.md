---
'@ai-sdk/harness': patch
---

fix(harness): settle a turn aborted by the caller's abortSignal with an `abort` stream part instead of an AbortError `error` part, matching `streamText`'s abort contract. `toUIMessageStream` / `toUIMessageStreamResponse` now also forward the `onEnd` callback (previously only the deprecated `onFinish` alias was forwarded), so `onEnd({ isAborted })` observes aborted turns.
