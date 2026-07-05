import { describe, expect, it } from 'vitest';
import type { Telemetry } from 'ai';
import { createTurnTelemetry } from './turn-telemetry';

const finishReason = { unified: 'stop', raw: undefined };
const usage = {
  inputTokens: {
    total: undefined,
    noCache: undefined,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: undefined, text: undefined, reasoning: undefined },
};

function createRecordingIntegration() {
  const events: Array<{ type: string; event: Record<string, unknown> }> = [];
  const integration: Telemetry = {
    onStart: event => {
      events.push({ type: 'start', event: event as Record<string, unknown> });
    },
    onStepStart: event => {
      events.push({
        type: 'step-start',
        event: event as unknown as Record<string, unknown>,
      });
    },
    onStepEnd: event => {
      events.push({
        type: 'step-end',
        event: event as unknown as Record<string, unknown>,
      });
    },
    onEnd: event => {
      events.push({ type: 'end', event: event as Record<string, unknown> });
    },
  };
  return { events, integration };
}

function createTelemetry(integration: Telemetry) {
  return createTurnTelemetry({
    telemetry: { integrations: [integration] },
    harnessId: 'test-harness',
    modelId: 'test-model',
    instructions: undefined,
    promptText: 'hello',
    runtimeContext: undefined,
  });
}

const flushCallbacks = () => new Promise(resolve => setTimeout(resolve, 0));

describe('createTurnTelemetry', () => {
  it('sends matching step numbers in onStepStart and onStepEnd events', async () => {
    const { events, integration } = createRecordingIntegration();
    const telemetry = createTelemetry(integration);

    telemetry.start();
    telemetry.ensureStepOpen();
    telemetry.stepFinish({ finishReason, usage });
    telemetry.ensureStepOpen();
    telemetry.stepFinish({ finishReason, usage });
    telemetry.end({ finishReason, usage });
    await flushCallbacks();

    const stepStartNumbers = events
      .filter(entry => entry.type === 'step-start')
      .map(entry => entry.event.stepNumber);
    const stepEndNumbers = events
      .filter(entry => entry.type === 'step-end')
      .map(entry => entry.event.stepNumber);
    expect(stepStartNumbers).toEqual([0, 1]);
    expect(stepEndNumbers).toEqual([0, 1]);
  });

  it('sends the open step number in the onStepEnd event fired from end()', async () => {
    const { events, integration } = createRecordingIntegration();
    const telemetry = createTelemetry(integration);

    telemetry.start();
    telemetry.ensureStepOpen();
    telemetry.stepFinish({ finishReason, usage });
    // A step left open when the turn ends is closed by end() itself.
    telemetry.ensureStepOpen();
    telemetry.end({ finishReason, usage });
    await flushCallbacks();

    const stepEndNumbers = events
      .filter(entry => entry.type === 'step-end')
      .map(entry => entry.event.stepNumber);
    expect(stepEndNumbers).toEqual([0, 1]);
  });
});
