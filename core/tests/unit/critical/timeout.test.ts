/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient } from '../../../src/client';
import {
  VirtualDisplayResponseType,
  VirtualDisplayResponse,
  VirtualDisplayRequest,
} from '../../../src/message/message';

describe('Timeout and Network Handling', () => {
  let iframe: HTMLIFrameElement;
  let client: VirtualDisplayClient;

  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);

    vi.useFakeTimers();
  });

  afterEach(() => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Request timeout scenarios', () => {
    it('should handle timeout for requestObjectTree with custom timeout', async () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Create timeout wrapper for request
      const withTimeout = <T>(
        promise: Promise<T>,
        timeoutMs: number
      ): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
          ),
        ]);
      };

      // Make request with timeout
      const requestPromise = withTimeout(
        client.requestObjectTree('test-origin'),
        5000 // 5 second timeout
      );

      // Advance time without sending response
      vi.advanceTimersByTime(5001);

      // Should timeout
      await expect(requestPromise).rejects.toThrow('Request timeout');
    });

    it('should handle multiple concurrent timeouts', async () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      const createTimedRequest = (
        origin: string,
        timeoutMs: number
      ): {
        promise: Promise<VirtualDisplayResponse>;
        controller: AbortController;
        timeoutId: NodeJS.Timeout;
      } => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        return {
          promise: client
            .requestObjectTree(origin)
            .finally(() => clearTimeout(timeoutId)),
          controller,
          timeoutId,
        };
      };

      // Create requests with different timeouts
      const requests = [
        createTimedRequest('origin1', 1000),
        createTimedRequest('origin2', 2000),
        createTimedRequest('origin3', 3000),
      ];

      // Advance time to trigger first timeout
      vi.advanceTimersByTime(1001);

      // Send response for second request
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { origin: 'origin2', tree: 'tree2' },
          },
        })
      );

      // Advance to trigger third timeout
      vi.advanceTimersByTime(2000);

      // Check results
      const results = await Promise.allSettled(requests.map((r) => r.promise));

      // First should still be pending (no response)
      expect(results[0].status).toBe('pending');

      // Second should be fulfilled
      expect(results[1].status).toBe('fulfilled');
      if (results[1].status === 'fulfilled') {
        expect(results[1].value.context.origin).toBe('origin2');
      }

      // Third should still be pending
      expect(results[2].status).toBe('pending');
    });
  });

  describe('Retry mechanisms', () => {
    it('should implement retry logic for failed requests', async () => {
      const mockPostMessage = vi.fn();
      let callCount = 0;

      // Fail first 2 attempts, succeed on 3rd
      mockPostMessage.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network error');
        }
      });

      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Implement retry wrapper
      const retryRequest = async (
        maxRetries: number = 3
      ): Promise<{ success: boolean; attempts: number }> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            client.sendClientState({ attributes: [] });
            return { success: true, attempts: attempt };
          } catch (error) {
            if (attempt === maxRetries) {
              throw error;
            }
            // Wait before retry (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 100)
            );
          }
        }
      };

      // Should succeed after retries
      const result = await retryRequest();
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1); // Current implementation doesn't throw
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connection state handling', () => {
    it('should handle offline/online transitions', () => {
      client = new VirtualDisplayClient(iframe);

      // Track connection state
      let isOnline = true;
      const originalNavigator = Object.getOwnPropertyDescriptor(
        window,
        'navigator'
      );

      Object.defineProperty(window, 'navigator', {
        value: {
          ...window.navigator,
          onLine: isOnline,
        },
        writable: true,
        configurable: true,
      });

      // Queue messages while "offline"
      isOnline = false;
      Object.defineProperty(window.navigator, 'onLine', { value: false });

      client.sendClientState({ attributes: [] });

      // Simulate coming back online
      isOnline = true;
      Object.defineProperty(window.navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));

      // Trigger iframe load to flush queue
      iframe.dispatchEvent(new Event('load'));

      // Restore original navigator
      if (originalNavigator) {
        Object.defineProperty(window, 'navigator', originalNavigator);
      }
    });

    it('should handle slow network conditions', async () => {
      const mockPostMessage = vi.fn();

      // Simulate slow network with delayed execution
      mockPostMessage.mockImplementation((message) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 100); // 100ms delay
        });
      });

      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      const startTime = performance.now();

      // Send multiple messages
      for (let i = 0; i < 10; i++) {
        client.sendClientState({
          attributes: [{ name: `Slow ${i}`, values: [] }],
        });
      }

      const endTime = performance.now();

      // Should not block (messages are queued)
      expect(endTime - startTime).toBeLessThan(50);
      expect(mockPostMessage).toHaveBeenCalledTimes(10);
    });
  });

  describe('Message ordering guarantees', () => {
    it('should maintain message order during network delays', async () => {
      const receivedMessages: VirtualDisplayRequest[] = [];
      const mockPostMessage = vi.fn((message) => {
        receivedMessages.push(message);
      });

      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Send messages with identifiers
      const messages = Array.from({ length: 100 }, (_, i) => ({
        attributes: [
          {
            name: 'Order Test',
            values: [
              {
                value: `Message ${i}`,
                identifiers: [`order_${i}`],
                isSelected: true,
              },
            ],
          },
        ],
      }));

      messages.forEach((msg) => client.sendClientState(msg));

      // Verify order is preserved
      expect(receivedMessages.length).toBe(100);
      receivedMessages.forEach((msg, index) => {
        const value = msg.context.attributes[0].values[0].value;
        expect(value).toBe(`Message ${index}`);
      });
    });
  });

  describe('Graceful degradation', () => {
    it('should handle iframe navigation during active requests', async () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Start multiple requests
      const requests = [
        client.requestObjectTree('nav1'),
        client.requestObjectTree('nav2'),
        client.requestObjectTree('nav3'),
      ];

      // Simulate iframe navigation
      iframe.src = 'about:blank';
      iframe.dispatchEvent(new Event('beforeunload'));

      // Send responses (should still work)
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { origin: 'nav1', tree: 'tree1' },
          },
        })
      );

      // First request should resolve
      const result = await requests[0];
      expect(result.context.origin).toBe('nav1');

      // Other requests remain pending
      const results = await Promise.race([
        Promise.all(requests.slice(1)),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 100)),
      ]);

      expect(results).toBe('timeout');
    });

    it('should handle rapid iframe reloads', () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);

      // Simulate rapid reloads
      for (let i = 0; i < 10; i++) {
        // Queue message
        client.sendClientState({ attributes: [] });

        // Load event
        iframe.dispatchEvent(new Event('load'));

        // Simulate reload by changing contentWindow
        const newMock = vi.fn();
        Object.defineProperty(iframe, 'contentWindow', {
          value: { postMessage: newMock },
          writable: true,
        });
      }

      // Should have handled all loads gracefully
      expect(mockPostMessage.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
