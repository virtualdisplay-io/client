import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EventBus } from '../../../src/events/event-bus';
import { EVENT_NAMES } from '../../../src/events/event-names';
import { MESSAGE_TYPES, type StateMessage } from '../../../src/messaging/message-types';
import { StateService } from '../../../src/nodes/state-service';
import { logger } from '../../../src/utils/logger';

describe('StateService logging', () => {
  let eventBus: EventBus = new EventBus();
  let stateService: StateService = new StateService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    stateService = new StateService(eventBus);
  });

  it('should log correct initial state info', () => {
    const logSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

    const stateMessage: StateMessage = {
      type: MESSAGE_TYPES.STATE,
      nodes: [
        {
          id: 'node1',
          name: 'Node 1',
          type: 'mesh',
          visible: true,
        },
      ],
      isInitial: true,
    };

    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, { message: stateMessage });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('State updated'),
      expect.objectContaining({
        wasInitialState: true,
      }),
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Initial state received - client is now ready'),
    );

    // Verify state was actually updated
    expect(stateService.isReady).toBe(true);

    logSpy.mockRestore();
  });

  it('should log correct non-initial state info', () => {
    const logSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

    const stateMessage: StateMessage = {
      type: MESSAGE_TYPES.STATE,
      nodes: [
        {
          id: 'node1',
          name: 'Node 1',
          type: 'mesh',
          visible: true,
        },
      ],
      isInitial: false,
    };

    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, { message: stateMessage });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('State updated'),
      expect.objectContaining({
        wasInitialState: false,
      }),
    );

    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Initial state received - client is now ready'),
    );

    // Verify state was updated but not ready
    expect(stateService.isReady).toBe(false);

    logSpy.mockRestore();
  });
});
