import { describe, it, expect, beforeEach } from 'vitest';

import { EventBus } from '../../../src/events/event-bus';
import { EVENT_NAMES } from '../../../src/events/event-names';
import { MESSAGE_TYPES, type StateMessage } from '../../../src/messaging/message-types';
import { StateService } from '../../../src/nodes/state-service';

describe('StateService state updates', () => {
  let eventBus: EventBus = new EventBus();
  let stateService: StateService = new StateService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    stateService = new StateService(eventBus);
  });

  it('should remain ready after subsequent non-initial updates', () => {
    // First send initial state
    const initialMessage: StateMessage = {
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

    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, { message: initialMessage });
    expect(stateService.isReady).toBe(true);

    // Then send update
    const updateMessage: StateMessage = {
      type: MESSAGE_TYPES.STATE,
      nodes: [
        {
          id: 'node2',
          name: 'Node 2',
          type: 'mesh',
          visible: true,
        },
      ],
      isInitial: false,
    };

    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, { message: updateMessage });

    expect(stateService.isReady).toBe(true);
    const expectedNodeCount = 2;
    expect(stateService.nodeCount).toBe(expectedNodeCount);
  });

  it('should reset ready state when cleared', () => {
    // First make it ready
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

    // Clear it
    stateService.clear();

    expect(stateService.isReady).toBe(false);
    expect(stateService.nodeCount).toBe(0);
  });
});
