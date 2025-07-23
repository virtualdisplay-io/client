import { describe, it, expect } from 'vitest';

import { EVENT_NAMES, VirtualdisplayViewerService, type ConfigMessage } from '../../../src';
import { EventBus } from '../../../src/events/event-bus';

describe('UI Configuration Business Rules', () => {
  it('should send CONFIG with all explicitly set UI options', () => {
    // Tests that both true and false values are sent to server
    const eventBus = new EventBus();
    const service = new VirtualdisplayViewerService(eventBus);

    const capturedEvents: { message: ConfigMessage }[] = [];
    eventBus.on(EVENT_NAMES.CONFIG_MESSAGE, (event) => {
      capturedEvents.push(event as { message: ConfigMessage });
    });

    service.sendInitialConfig({
      parent: '#test',
      model: 'test',
      license: 'test',
      arEnabled: false,
      fullscreenEnabled: true,
      loadingIndicatorEnabled: false,
    });

    expect(capturedEvents).toHaveLength(1);
    expect(capturedEvents[0]?.message.config.ui).toEqual({
      arEnabled: false,
      fullscreenEnabled: true,
      loadingIndicatorEnabled: false,
    });
  });

  it('should send CONFIG when UI options are set', () => {
    const eventBus = new EventBus();
    const service = new VirtualdisplayViewerService(eventBus);

    const capturedEvents: { message: ConfigMessage }[] = [];
    eventBus.on(EVENT_NAMES.CONFIG_MESSAGE, (event) => {
      capturedEvents.push(event as { message: ConfigMessage });
    });

    service.sendInitialConfig({
      parent: '#test',
      model: 'test',
      license: 'test',
      arEnabled: true,
      fullscreenEnabled: true,
    });

    expect(capturedEvents).toHaveLength(1);
    expect(capturedEvents[0]?.message.config.ui).toEqual({
      arEnabled: true,
      fullscreenEnabled: true,
    });
  });
});
