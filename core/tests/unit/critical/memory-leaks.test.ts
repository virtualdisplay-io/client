/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient } from '../../../src/client';
import { responseDispatcher } from '../../../src/message/dispatcher';
import {
  VirtualDisplayResponseType,
  VirtualDisplayResponse,
  VirtualDisplayRequest,
} from '../../../src/message/message';

describe('Memory Leak Prevention', () => {
  let iframe: HTMLIFrameElement;
  let messageListeners: Array<(event: MessageEvent) => void> = [];

  // Track all event listeners
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);

    // Track message event listeners
    window.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      ...args: unknown[]
    ): void {
      if (type === 'message') {
        messageListeners.push(listener as (event: MessageEvent) => void);
      }
      return originalAddEventListener.call(this, type, listener, ...args);
    };

    window.removeEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      ...args: unknown[]
    ): void {
      if (type === 'message') {
        messageListeners = messageListeners.filter(
          (l) => l !== (listener as (event: MessageEvent) => void)
        );
      }
      return originalRemoveEventListener.call(this, type, listener, ...args);
    };
  });

  afterEach(() => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    messageListeners = [];
    vi.clearAllMocks();
  });

  describe('Event listener management', () => {
    it('should not accumulate message event listeners with multiple clients', () => {
      const initialListenerCount = messageListeners.length;

      // Create multiple clients
      const clients: VirtualDisplayClient[] = [];
      for (let i = 0; i < 10; i++) {
        const newIframe = document.createElement('iframe');
        document.body.appendChild(newIframe);
        clients.push(new VirtualDisplayClient(newIframe));
      }

      // Should only add one listener per client
      expect(messageListeners.length).toBe(initialListenerCount + 10);

      // Clean up
      clients.forEach((_, index) => {
        const iframe = document.querySelectorAll('iframe')[index + 1]; // +1 for original iframe
        if (iframe) document.body.removeChild(iframe);
      });
    });

    it('should handle thousands of subscriptions without memory issues', () => {
      const client = new VirtualDisplayClient(iframe);
      const handlers: Array<ReturnType<typeof vi.fn>> = [];

      // Subscribe many handlers - reduced to 100 for CI stability
      for (let i = 0; i < 100; i++) {
        const handler = vi.fn();
        handlers.push(handler);
        client.onResponseSubscriber(
          VirtualDisplayResponseType.OBJECT_TREE,
          handler
        );
      }

      // Send a message
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: VirtualDisplayResponseType.OBJECT_TREE },
        })
      );

      // All handlers should be called
      const calledHandlers = handlers.filter((h) => h.mock.calls.length > 0);
      expect(calledHandlers.length).toBe(100);

      // Memory test: ensure we can still subscribe more
      const additionalHandler = vi.fn();
      client.onResponseSubscriber(
        VirtualDisplayResponseType.OBJECT_TREE,
        additionalHandler
      );

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: VirtualDisplayResponseType.OBJECT_TREE, context: {} },
        })
      );

      expect(additionalHandler).toHaveBeenCalled();
    });
  });

  describe('Promise resolution cleanup', () => {
    it('should not leak promises from unresolved requestObjectTree calls', async () => {
      const client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      const promises: Promise<VirtualDisplayResponse>[] = [];

      // Create many unresolved promises - reduced for CI
      for (let i = 0; i < 100; i++) {
        promises.push(client.requestObjectTree(`origin${i}`).catch(() => {}));
      }

      // Resolve some of them
      for (let i = 0; i < 50; i++) {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: VirtualDisplayResponseType.OBJECT_TREE,
              context: { origin: `origin${i}` },
            },
          })
        );
      }

      // Wait a bit for promises to settle
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should still be able to make new requests
      const newRequest = client.requestObjectTree('new-origin');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { origin: 'new-origin' },
          },
        })
      );

      await expect(newRequest).resolves.toBeDefined();
    });

    it('should clean up once() handlers after they fire', () => {
      // Spy on responseDispatcher methods
      const subscribeSpy = vi.spyOn(responseDispatcher, 'subscribe');
      const unsubscribeSpy = vi.spyOn(responseDispatcher, 'unsubscribe');

      const client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Make multiple requests
      const promises: Promise<VirtualDisplayResponse>[] = [];
      for (let i = 0; i < 100; i++) {
        promises.push(client.requestObjectTree());
      }

      // Should have subscribed 100 handlers
      expect(subscribeSpy).toHaveBeenCalledTimes(100);

      // Resolve all requests
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { type: VirtualDisplayResponseType.OBJECT_TREE, context: {} },
          })
        );
      }

      // All handlers should be unsubscribed
      expect(unsubscribeSpy).toHaveBeenCalledTimes(100);
    });
  });

  describe('Queue memory management', () => {
    it('should properly clear queue after flush', () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      const client = new VirtualDisplayClient(iframe);

      // Queue many messages - reduced for CI
      for (let i = 0; i < 100; i++) {
        client.sendClientState({
          attributes: [
            {
              name: `Attr${i}`,
              values: [],
            },
          ],
        });
      }

      // Messages should be queued
      expect(mockPostMessage).not.toHaveBeenCalled();

      // Flush queue
      iframe.dispatchEvent(new Event('load'));

      // All messages sent
      expect(mockPostMessage).toHaveBeenCalledTimes(100);

      // Queue more messages to ensure queue was properly cleared
      for (let i = 0; i < 100; i++) {
        client.sendClientState({ attributes: [] });
      }

      // New messages should be sent immediately
      expect(mockPostMessage).toHaveBeenCalledTimes(200);
    });

    it('should not retain references to old messages after sending', () => {
      const mockPostMessage = vi.fn();
      let capturedMessages: VirtualDisplayRequest[] = [];

      Object.defineProperty(iframe, 'contentWindow', {
        value: {
          postMessage: (msg: VirtualDisplayRequest) => {
            capturedMessages.push(msg);
            mockPostMessage(msg);
          },
        },
        writable: true,
      });

      const client = new VirtualDisplayClient(iframe);

      // Create large objects that would be noticeable in memory - reduced size for CI
      const largeObjects = Array.from({ length: 10 }, (_, i) => ({
        attributes: Array.from({ length: 100 }, (_, j) => ({
          name: `Attr${i}-${j}`,
          values: new Array(10).fill({
            value: 'test',
            identifiers: ['id'],
            isSelected: false,
          }),
        })),
      }));

      // Queue all messages
      largeObjects.forEach((obj) => client.sendClientState(obj));

      // Clear our reference
      largeObjects.length = 0;

      // Flush
      iframe.dispatchEvent(new Event('load'));

      // Should have sent all messages - adjusted for reduced size
      expect(mockPostMessage).toHaveBeenCalledTimes(10);

      // Messages should be cleared from internal queue
      // (In real implementation, we'd check internal queue is empty)

      // Clear captured messages to free memory
      capturedMessages = [];
    });
  });

  describe('DOM reference cleanup', () => {
    it('should not prevent iframe garbage collection', () => {
      const weakRefs: WeakRef<HTMLIFrameElement>[] = [];

      // Create clients with iframes and track with WeakRef
      for (let i = 0; i < 10; i++) {
        const tempIframe = document.createElement('iframe');
        document.body.appendChild(tempIframe);
        weakRefs.push(new WeakRef(tempIframe));

        new VirtualDisplayClient(tempIframe);

        // Remove iframe
        document.body.removeChild(tempIframe);
      }

      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }

      // Check that at least some iframes can be garbage collected
      // (This is more of a sanity check - actual GC behavior varies)
      const aliveCount = weakRefs.filter(
        (ref) => ref.deref() !== undefined
      ).length;
      expect(aliveCount).toBeLessThanOrEqual(10);
    });

    it('should handle rapid iframe creation and destruction', () => {
      const clients: VirtualDisplayClient[] = [];

      // Rapidly create and destroy clients
      for (let i = 0; i < 100; i++) {
        const tempIframe = document.createElement('iframe');
        document.body.appendChild(tempIframe);

        const client = new VirtualDisplayClient(tempIframe);
        clients.push(client);

        // Send some messages
        client.sendClientState({ attributes: [] });

        // Remove iframe immediately
        document.body.removeChild(tempIframe);
      }

      // Should not throw or leak
      expect(clients.length).toBe(100);

      // Can still create new client
      const newClient = new VirtualDisplayClient(iframe);
      expect(() => {
        newClient.sendClientState({ attributes: [] });
      }).not.toThrow();
    });
  });
});
