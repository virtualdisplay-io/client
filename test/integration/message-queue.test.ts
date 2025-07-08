import { describe, expect, it, beforeEach, vi } from 'vitest';

import { type MutationMessage, EVENT_NAMES } from '../../src';
import { EventBus } from '../../src/events/event-bus';
import { MessageHandler } from '../../src/messaging/message-handler';

describe('Integration: Message Queue Basic Behavior', () => {
  let eventBus = new EventBus();
  let messageHandler = new MessageHandler(eventBus);
  let mockIframe = {} as HTMLIFrameElement;
  let postMessageSpy = vi.fn();

  beforeEach(() => {
    eventBus = new EventBus();
    messageHandler = new MessageHandler(eventBus);

    // Setup mock iframe
    postMessageSpy = vi.fn();
    mockIframe = {
      contentWindow: {
        postMessage: postMessageSpy,
      },
    } as unknown as HTMLIFrameElement;
  });

  it('should queue messages until iframe is ready', () => {
    // Given: Connected iframe but not ready yet
    messageHandler.setIframe(mockIframe);

    const message1: MutationMessage = {
      type: 'mutation',
      mutations: [{ type: 'show', nodeId: 'node1' }],
    };
    const message2: MutationMessage = {
      type: 'mutation',
      mutations: [{ type: 'hide', nodeId: 'node2' }],
    };

    // When: Messages are sent before ready state
    eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message: message1 });
    eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message: message2 });

    // Then: Messages should not be sent yet
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('should send messages immediately when already ready', () => {
    // Given: Connected iframe that is already ready
    messageHandler.setIframe(mockIframe);
    eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

    // Reset spy to track only new calls
    postMessageSpy.mockClear();

    // When: New message is sent
    const message: MutationMessage = {
      type: 'mutation',
      mutations: [{ type: 'show', nodeId: 'node3' }],
    };
    eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message });

    // Then: Message should be sent immediately
    expect(postMessageSpy).toHaveBeenCalledWith(message, '*');
  });
});

describe('Integration: Message Queue Ready State', () => {
  let eventBus = new EventBus();
  let messageHandler = new MessageHandler(eventBus);
  let mockIframe = {} as HTMLIFrameElement;
  let postMessageSpy = vi.fn();

  beforeEach(() => {
    eventBus = new EventBus();
    messageHandler = new MessageHandler(eventBus);

    postMessageSpy = vi.fn();
    mockIframe = {
      contentWindow: {
        postMessage: postMessageSpy,
      },
    } as unknown as HTMLIFrameElement;
  });

  it('should send all queued messages when iframe becomes ready', () => {
    testQueuedMessages({ eventBus, messageHandler, mockIframe, postMessageSpy });
  });

  it('should verify queue is empty after messages are sent', () => {
    testQueueEmptyAfterSend({ eventBus, messageHandler, mockIframe, postMessageSpy });
  });
});

interface MessageQueueTestContext {
  eventBus: EventBus;
  messageHandler: MessageHandler;
  mockIframe: HTMLIFrameElement;
  postMessageSpy: ReturnType<typeof vi.fn>;
}

function testQueuedMessages(context: MessageQueueTestContext): void {
  const { eventBus, messageHandler, mockIframe, postMessageSpy } = context;
  messageHandler.setIframe(mockIframe);

  const messages = createTestMessages();
  queueMessages(eventBus, messages);
  eventBus.emit(EVENT_NAMES.IFRAME_READY, {});
  verifyMessagesWereSent(postMessageSpy, messages);
}

function createTestMessages(): [MutationMessage, MutationMessage] {
  const message1: MutationMessage = {
    type: 'mutation',
    mutations: [{ type: 'show', nodeId: 'node1' }],
  };
  const message2: MutationMessage = {
    type: 'mutation',
    mutations: [{ type: 'hide', nodeId: 'node2' }],
  };
  return [message1, message2];
}

function queueMessages(eventBus: EventBus, messages: [MutationMessage, MutationMessage]): void {
  eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message: messages[0] });
  eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, { message: messages[1] });
}

function verifyMessagesWereSent(
  postMessageSpy: ReturnType<typeof vi.fn>,
  messages: [MutationMessage, MutationMessage],
): void {
  const firstCall = 1;
  const secondCall = 2;
  expect(postMessageSpy).toHaveBeenNthCalledWith(firstCall, messages[0], '*');
  expect(postMessageSpy).toHaveBeenNthCalledWith(secondCall, messages[1], '*');
}

function testQueueEmptyAfterSend(context: MessageQueueTestContext): void {
  const { eventBus, messageHandler, mockIframe, postMessageSpy } = context;
  messageHandler.setIframe(mockIframe);

  const messages = createTestMessages();
  queueMessages(eventBus, messages);
  eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

  verifyQueueStatus(postMessageSpy, messages[1]);
}

function verifyQueueStatus(
  postMessageSpy: ReturnType<typeof vi.fn>,
  lastMessage: MutationMessage,
): void {
  const secondCall = 2;
  expect(postMessageSpy).toHaveBeenNthCalledWith(secondCall, lastMessage, '*');
}
