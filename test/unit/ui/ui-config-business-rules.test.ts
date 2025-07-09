import { describe, it, expect } from 'vitest';

import { EVENT_NAMES, VirtualdisplayViewerService, type ConfigMessage } from '../../../src';
import { EventBus } from '../../../src/events/event-bus';

describe('UI Configuration Business Rules', () => {
  it('should only send CONFIG for explicitly disabled options (not for enabled/undefined)', () => {
    // This tests an important business rule:
    // - Server defaults all UI to enabled (true)
    // - Client should only send config when explicitly disabling (false)
    // - This minimizes network traffic and prevents unnecessary messages

    const eventBus = new EventBus();
    const service = new VirtualdisplayViewerService(eventBus);

    const capturedEvents: { message: ConfigMessage }[] = [];
    eventBus.on(EVENT_NAMES.CONFIG_MESSAGE, (event) => {
      capturedEvents.push(event as { message: ConfigMessage });
    });

    // Test with mix of disabled, enabled, and undefined options
    service.sendInitialConfig({
      parent: '#test',
      model: 'test',
      license: 'test',
      arEnabled: false, // Should be sent
      fullscreenEnabled: true, // Should NOT be sent (default)
      loadingIndicatorEnabled: false, // Should be sent
      // Other options undefined - Should NOT be sent
    });

    // Verify only disabled options were sent
    expect(capturedEvents).toHaveLength(1);
    expect(capturedEvents[0]?.message.config.ui).toEqual({
      arEnabled: false,
      loadingIndicatorEnabled: false,
      // Note: fullscreenEnabled is NOT included
    });
  });

  it('should not send any CONFIG when all options use defaults', () => {
    const eventBus = new EventBus();
    const service = new VirtualdisplayViewerService(eventBus);

    const capturedEvents: { message: ConfigMessage }[] = [];
    eventBus.on(EVENT_NAMES.CONFIG_MESSAGE, (event) => {
      capturedEvents.push(event as { message: ConfigMessage });
    });

    // All options are either true or undefined (server defaults)
    service.sendInitialConfig({
      parent: '#test',
      model: 'test',
      license: 'test',
      arEnabled: true,
      fullscreenEnabled: true,
      // LoadingIndicatorEnabled: undefined
    });

    // No message should be sent
    expect(capturedEvents).toHaveLength(0);
  });
});
