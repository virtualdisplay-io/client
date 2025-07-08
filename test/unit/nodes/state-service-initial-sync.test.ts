import { describe, it, expect, beforeEach } from 'vitest';

import { EventBus } from '../../../src/events/event-bus';
import { EVENT_NAMES } from '../../../src/events/event-names';
import { MESSAGE_TYPES, type StateMessage } from '../../../src/messaging/message-types';
import { StateService } from '../../../src/nodes/state-service';

describe('StateService initial sync', () => {
  let eventBus: EventBus = new EventBus();
  let stateService: StateService = new StateService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    stateService = new StateService(eventBus);
  });

  it('should not be ready before initial sync', () => {
    expect(stateService.isReady).toBe(false);
  });

  it('should be ready after receiving initial state', () => {
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

    expect(stateService.isReady).toBe(true);
    expect(stateService.nodeCount).toBe(1);
  });

  it('should not become ready from non-initial state updates', () => {
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

    expect(stateService.isReady).toBe(false);
    expect(stateService.nodeCount).toBe(1);
  });
});
