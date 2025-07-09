import {
  describe, expect, it, beforeEach, vi, afterEach,
} from 'vitest';

import { EVENT_NAMES, MESSAGE_TYPES, type StateMessage, Mutation, NODE_TYPES } from '../../../src';
import { EventBus } from '../../../src/events/event-bus';
import { MessageHandler } from '../../../src/messaging/message-handler';
import { createMutationMessage } from '../../../src/messaging/message-utils';

describe('MessageHandler - Basic Setup', () => {
  let eventBus = new EventBus();
  let handler = new MessageHandler(eventBus);
  let mockIframe = {} as HTMLIFrameElement;
  let postMessageSpy = vi.fn();

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new MessageHandler(eventBus);
    postMessageSpy = vi.fn();

    mockIframe = {
      src: 'https://example.com/viewer',
      contentWindow: {
        postMessage: postMessageSpy,
      },
    } as unknown as HTMLIFrameElement;
  });

  afterEach(() => {
    handler.destroy();
    vi.clearAllMocks();
  });

  it('should create handler with event bus', () => {
    expect(handler).toBeDefined();
  });

  it('should accept iframe configuration', () => {
    handler.setIframe(mockIframe);
    // No error should be thrown
  });
});

describe('MessageHandler - Message Queueing', () => {
  let eventBus = new EventBus();
  let handler = new MessageHandler(eventBus);
  let mockIframe = {} as HTMLIFrameElement;
  let postMessageSpy = vi.fn();

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new MessageHandler(eventBus);
    postMessageSpy = vi.fn();

    mockIframe = {
      src: 'https://example.com/viewer',
      contentWindow: {
        postMessage: postMessageSpy,
      },
    } as unknown as HTMLIFrameElement;

    handler.setIframe(mockIframe);
  });

  afterEach(() => {
    handler.destroy();
    vi.clearAllMocks();
  });

  it('should queue messages before ready', () => {
    const message = createMutationMessage([Mutation.show('node1')]);

    eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message });

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('should send messages after ready', () => {
    // Mark as ready
    eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

    const message = createMutationMessage([Mutation.show('node1')]);
    eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message });

    expect(postMessageSpy).toHaveBeenCalledWith(message, '*');
  });
});

describe('MessageHandler - Queue Processing', () => {
  let eventBus = new EventBus();
  let handler = new MessageHandler(eventBus);
  let mockIframe = {} as HTMLIFrameElement;
  let postMessageSpy = vi.fn();

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new MessageHandler(eventBus);
    postMessageSpy = vi.fn();

    mockIframe = {
      src: 'https://example.com/viewer',
      contentWindow: {
        postMessage: postMessageSpy,
      },
    } as unknown as HTMLIFrameElement;

    handler.setIframe(mockIframe);
  });

  afterEach(() => {
    handler.destroy();
    vi.clearAllMocks();
  });

  it('should process queued messages when ready', () => {
    const message1 = createMutationMessage([Mutation.show('node1')]);
    const message2 = createMutationMessage([Mutation.hide('node2')]);

    queueTwoMessages(eventBus, message1, message2);
    verifyMessagesQueued(postMessageSpy);

    eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

    verifyMessagesSent({ postMessageSpy, handler, message1, message2 });
  });

  it('should queue CONFIG messages before ready', () => {
    const configMessage = {
      type: MESSAGE_TYPES.CONFIG,
      config: {
        ui: {
          arEnabled: false,
          fullscreenEnabled: true,
        },
      },
    };

    eventBus.emit(EVENT_NAMES.CONFIG_MESSAGE, { message: configMessage });

    expect(postMessageSpy).not.toHaveBeenCalled();

    // Mark as ready
    eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

    // CONFIG message should be sent
    expect(postMessageSpy).toHaveBeenCalledWith(configMessage, '*');
  });
});

describe('MessageHandler - Valid Message Receiving', () => {
  let eventBus = new EventBus();
  let handler = new MessageHandler(eventBus);
  let eventBusSpy = vi.spyOn(eventBus, 'emit');

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new MessageHandler(eventBus);
    eventBusSpy = vi.spyOn(eventBus, 'emit');
  });

  afterEach(() => {
    handler.destroy();
    vi.clearAllMocks();
  });

  it('should handle valid incoming messages', () => {
    const stateMessage: StateMessage = {
      type: MESSAGE_TYPES.STATE,
      nodes: [
        {
          id: 'node1',
          name: 'node1',
          type: NODE_TYPES.MESH,
          visible: true,
        },
      ],
      isInitial: false,
    };

    const messageEvent = new MessageEvent('message', {
      data: stateMessage,
      origin: 'https://example.com',
    });

    window.dispatchEvent(messageEvent);

    expect(eventBusSpy).toHaveBeenCalledWith(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: stateMessage,
    });
  });
});

describe('MessageHandler - Invalid Message Handling', () => {
  let eventBus = new EventBus();
  let handler = new MessageHandler(eventBus);
  let eventBusSpy = vi.spyOn(eventBus, 'emit');

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new MessageHandler(eventBus);
    eventBusSpy = vi.spyOn(eventBus, 'emit');
  });

  afterEach(() => {
    handler.destroy();
    vi.clearAllMocks();
  });

  it('should ignore invalid messages', () => {
    const invalidMessage = { foo: 'bar' };

    const messageEvent = new MessageEvent('message', {
      data: invalidMessage,
      origin: 'https://example.com',
    });

    window.dispatchEvent(messageEvent);

    expect(eventBusSpy).not.toHaveBeenCalledWith(EVENT_NAMES.MESSAGE_RECEIVED, expect.any(Object));
  });

  it('should ignore non-object messages', () => {
    const messageEvent = new MessageEvent('message', {
      data: 'string message',
      origin: 'https://example.com',
    });

    window.dispatchEvent(messageEvent);

    expect(eventBusSpy).not.toHaveBeenCalledWith(EVENT_NAMES.MESSAGE_RECEIVED, expect.any(Object));
  });
});

function queueTwoMessages(
  eventBus: EventBus,
  message1: ReturnType<typeof createMutationMessage>,
  message2: ReturnType<typeof createMutationMessage>,
): void {
  eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message: message1 });
  eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message: message2 });
}

function verifyMessagesQueued(
  postMessageSpy: ReturnType<typeof vi.fn>,
): void {
  expect(postMessageSpy).not.toHaveBeenCalled();
}

interface VerifyMessagesSentParams {
  postMessageSpy: ReturnType<typeof vi.fn>;
  handler: MessageHandler;
  message1: ReturnType<typeof createMutationMessage>;
  message2: ReturnType<typeof createMutationMessage>;
}

function verifyMessagesSent(params: VerifyMessagesSentParams): void {
  const { postMessageSpy, message1, message2 } = params;
  expect(postMessageSpy).toHaveBeenCalledTimes(2);
  expect(postMessageSpy).toHaveBeenCalledWith(message1, '*');
  expect(postMessageSpy).toHaveBeenCalledWith(message2, '*');
}
