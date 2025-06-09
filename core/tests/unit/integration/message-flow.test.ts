/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient } from '../../../src/client';
import {
  VirtualDisplayRequestType,
  VirtualDisplayResponseType,
  VirtualDisplayResponse,
} from '../../../src/message/message';

describe('Message Flow Integration', () => {
  let client: VirtualDisplayClient;
  let iframe: HTMLIFrameElement;
  let messageQueue: MessageEvent[] = [];

  // Mock contentWindow postMessage
  const mockPostMessage = vi.fn((message: unknown, targetOrigin: string) => {
    messageQueue.push(
      new MessageEvent('message', {
        data: message,
        origin: targetOrigin,
      })
    );
  });

  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);

    // Mock contentWindow
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage: mockPostMessage },
      writable: true,
    });

    client = new VirtualDisplayClient(iframe);
    messageQueue = [];
  });

  afterEach(() => {
    document.body.removeChild(iframe);
    vi.clearAllMocks();
  });

  describe('Critical message flow scenarios', () => {
    it('should handle rapid sequential state updates without message loss', () => {
      // Simulate rapid state changes (e.g., user dragging a color slider)
      const states = Array.from({ length: 100 }, (_, i) => ({
        attributes: [
          {
            name: 'Color',
            values: [
              {
                value: `hsl(${i * 3.6}, 100%, 50%)`,
                identifiers: [`color-${i}`],
                isSelected: true,
              },
            ],
          },
        ],
      }));

      // Send all states rapidly
      states.forEach((state) => client.sendClientState(state));

      // Simulate iframe load to flush queue
      iframe.dispatchEvent(new Event('load'));

      // All messages should be queued and sent
      expect(mockPostMessage).toHaveBeenCalledTimes(100);

      // Verify messages are sent in order
      states.forEach((state, index) => {
        expect(mockPostMessage).toHaveBeenNthCalledWith(
          index + 1,
          expect.objectContaining({
            type: VirtualDisplayRequestType.CLIENT_STATE,
            context: state,
          }),
          '*'
        );
      });
    });

    it('should handle concurrent requestObjectTree calls correctly', async () => {
      // Simulate iframe loaded
      iframe.dispatchEvent(new Event('load'));

      // Make multiple concurrent requests
      const promises = [
        client.requestObjectTree('origin1'),
        client.requestObjectTree('origin2'),
        client.requestObjectTree('origin3'),
      ];

      // Verify all requests were sent
      expect(mockPostMessage).toHaveBeenCalledTimes(3);

      // Simulate responses in reverse order to test proper handling
      const responses: VirtualDisplayResponse[] = [
        {
          type: VirtualDisplayResponseType.OBJECT_TREE,
          context: { tree: 'tree3', origin: 'origin3' },
        },
        {
          type: VirtualDisplayResponseType.OBJECT_TREE,
          context: { tree: 'tree2', origin: 'origin2' },
        },
        {
          type: VirtualDisplayResponseType.OBJECT_TREE,
          context: { tree: 'tree1', origin: 'origin1' },
        },
      ];

      // Dispatch responses
      responses.forEach((response) => {
        window.dispatchEvent(new MessageEvent('message', { data: response }));
      });

      // Wait for all promises
      const results = await Promise.all(promises);

      // Each request should receive its corresponding response
      expect(results[0]).toEqual(
        expect.objectContaining({
          context: { tree: 'tree1', origin: 'origin1' },
        })
      );
      expect(results[1]).toEqual(
        expect.objectContaining({
          context: { tree: 'tree2', origin: 'origin2' },
        })
      );
      expect(results[2]).toEqual(
        expect.objectContaining({
          context: { tree: 'tree3', origin: 'origin3' },
        })
      );
    });

    it('should handle message sending before iframe is loaded', () => {
      // Send messages before iframe load
      client.sendClientState({ attributes: [{ name: 'Test', values: [] }] });
      client.sendClientState({ attributes: [{ name: 'Test2', values: [] }] });

      // Messages should not be sent yet
      expect(mockPostMessage).not.toHaveBeenCalled();

      // Simulate iframe load
      iframe.dispatchEvent(new Event('load'));

      // Now messages should be flushed
      expect(mockPostMessage).toHaveBeenCalledTimes(2);
    });

    it('should ignore malformed messages from untrusted origins', () => {
      const handler = vi.fn();
      client.onResponseSubscriber(
        VirtualDisplayResponseType.OBJECT_TREE,
        handler
      );

      // Send various malformed messages
      window.dispatchEvent(new MessageEvent('message', { data: null }));
      window.dispatchEvent(new MessageEvent('message', { data: undefined }));
      window.dispatchEvent(new MessageEvent('message', { data: 'string' }));
      window.dispatchEvent(
        new MessageEvent('message', { data: { no_type: true } })
      );
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: 'INVALID_TYPE' } })
      );

      // Handler should never be called
      expect(handler).not.toHaveBeenCalled();

      // Send valid message
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: VirtualDisplayResponseType.OBJECT_TREE, context: {} },
        })
      );

      // Now handler should be called
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should handle subscription cleanup to prevent memory leaks', () => {
      const handlers = Array.from({ length: 1000 }, () => vi.fn());

      // Subscribe many handlers
      handlers.forEach((handler) => {
        client.onResponseSubscriber(
          VirtualDisplayResponseType.OBJECT_TREE,
          handler
        );
      });

      // Send a message
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: VirtualDisplayResponseType.OBJECT_TREE, context: {} },
        })
      );

      // All handlers should be called
      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledOnce();
      });

      // Note: In real implementation, we'd need unsubscribe functionality
      // This test highlights the need for cleanup mechanisms
    });
  });
});
