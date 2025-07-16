import type { Message } from './message-types';
import { isValidMessage } from './message-utils';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import type { MessageEvent as DomainMessageEvent } from '../events/event-types';
import { logger } from '../utils/logger';

/**
 * Unified message handler for both sending and receiving messages
 * Combines functionality of sender, receiver, and queue management
 */
export class MessageHandler {
  private readonly eventBus: EventBus;

  private iframe: HTMLIFrameElement | undefined;

  private isReady = false;

  private readonly queue: Message[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupIncomingMessages();
    this.setupOutgoingMessages();
    this.setupReadyListener();
  }

  public setIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleWindowMessage);
    this.queue.length = 0;
    this.isReady = false;
  }

  private queueOrSend(message: Message): void {
    if (!this.isReady) {
      this.queue.push(message);
      return;
    }

    this.send(message);
  }

  private send(message: Message): void {
    if (!this.canSend()) {
      logger.warn('Cannot send message - iframe not ready', {
        type: message.type,
        hasIframe: this.iframe !== undefined,
        hasContentWindow: this.iframe?.contentWindow !== null,
      });
      return;
    }

    const targetOrigin = '*';

    logger.debug('Sending message to server', {
      type: message.type,
      targetOrigin,
      payload: message,
    });

    this.iframe!.contentWindow!.postMessage(message, targetOrigin);
    logger.debug('Message sent to server', message);
  }

  private canSend(): boolean {
    return this.iframe?.contentWindow !== null && this.iframe?.contentWindow !== undefined;
  }

  private processQueue(): void {
    const messages = [...this.queue];
    this.queue.length = 0;

    messages.forEach(message => {
      this.send(message);
    });
  }

  private readonly handleWindowMessage = (event: globalThis.MessageEvent): void => {
    if (!isValidMessage(event.data)) {
      return;
    }

    const message = event.data;

    logger.info('Valid message received from server', {
      type: message.type,
      payload: message,
      origin: event.origin,
    });

    // Re-emit as MESSAGE_RECEIVED for other services to handle
    this.eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message,
    });
  };

  private setupIncomingMessages(): void {
    window.addEventListener('message', this.handleWindowMessage);
  }

  private setupOutgoingMessages(): void {
    const outgoingEvents = [
      EVENT_NAMES.MUTATION_MESSAGE,
      EVENT_NAMES.CONFIG_MESSAGE,
      EVENT_NAMES.CAMERA_MESSAGE,
    ];

    outgoingEvents.forEach(eventName => {
      this.eventBus.on(eventName, (event: DomainMessageEvent) => {
        this.queueOrSend(event.message);
      });
    });
  }

  private setupReadyListener(): void {
    this.eventBus.once(EVENT_NAMES.IFRAME_READY, () => {
      if (!this.isReady) {
        this.isReady = true;
        this.processQueue();
      }
    });
  }
}
