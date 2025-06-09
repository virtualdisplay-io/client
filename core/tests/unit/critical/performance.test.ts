/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient } from '../../../src/client';
import {
  VirtualDisplayRequestType,
  VirtualDisplayResponseType,
} from '../../../src/message/message';

describe('Performance Tests', () => {
  let iframe: HTMLIFrameElement;
  let client: VirtualDisplayClient;
  let mockPostMessage: ReturnType<typeof vi.fn>;
  let messageListeners: Array<(event: MessageEvent) => void> = [];

  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);

    mockPostMessage = vi.fn();
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage: mockPostMessage },
      writable: true,
    });

    // Track message event listeners for cleanup
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = ((type: string, listener: unknown) => {
      if (type === 'message' && typeof listener === 'function') {
        messageListeners.push(listener as (event: MessageEvent) => void);
      }
      originalAddEventListener.call(window, type, listener as EventListener);
    }) as typeof window.addEventListener;
  });

  afterEach(() => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }

    // Clean up all message listeners
    messageListeners.forEach((listener) => {
      window.removeEventListener('message', listener);
    });
    messageListeners = [];

    vi.clearAllMocks();
  });

  describe('Large state object handling', () => {
    it('should efficiently handle state with thousands of attributes', () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      const startTime = performance.now();

      // Create large state with nested structures
      const largeState = {
        attributes: Array.from({ length: 1000 }, (_, i) => ({
          name: `Attribute_${i}`,
          values: Array.from({ length: 10 }, (_, j) => ({
            value: `Value_${i}_${j}`,
            identifiers: [`id_${i}_${j}`, `alt_${i}_${j}`],
            isSelected: j === 0,
            metadata: {
              price: Math.random() * 1000,
              stock: Math.floor(Math.random() * 100),
              description: `Description for attribute ${i} value ${j}`,
            },
          })),
        })),
      };

      client.sendClientState(largeState);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete in reasonable time (< 100ms)
      expect(executionTime).toBeLessThan(100);

      // Should have sent the message
      expect(mockPostMessage).toHaveBeenCalledOnce();
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: largeState,
        }),
        '*'
      );
    });

    it('should handle rapid state updates without performance degradation', () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      const updateTimes: number[] = [];
      const stateCount = 1000;

      // Send many state updates rapidly
      for (let i = 0; i < stateCount; i++) {
        const startTime = performance.now();

        client.sendClientState({
          attributes: [
            {
              name: 'Performance Test',
              values: [
                {
                  value: `Update ${i}`,
                  identifiers: [`perf_${i}`],
                  isSelected: true,
                },
              ],
            },
          ],
        });

        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      // Calculate statistics
      const avgTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
      const maxTime = Math.max(...updateTimes);
      const minTime = Math.min(...updateTimes);

      // Performance should be consistent
      expect(avgTime).toBeLessThan(1); // Average < 1ms per update
      expect(maxTime).toBeLessThan(10); // No single update > 10ms

      // Performance shouldn't degrade over time
      const firstHalf = updateTimes.slice(0, stateCount / 2);
      const secondHalf = updateTimes.slice(stateCount / 2);
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((a, b) => a + b) / secondHalf.length;

      // Second half shouldn't be significantly slower than first half
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 2);
    });
  });

  describe('Message processing performance', () => {
    it('should efficiently process incoming messages', () => {
      // Create a fresh iframe for this test to avoid interference
      const testIframe = document.createElement('iframe');
      testIframe.id = 'perf-test-iframe';
      document.body.appendChild(testIframe);

      const testClient = new VirtualDisplayClient(testIframe);
      const handlers: Array<ReturnType<typeof vi.fn>> = [];

      // Register multiple handlers
      for (let i = 0; i < 100; i++) {
        const handler = vi.fn();
        handlers.push(handler);
        testClient.onResponseSubscriber(
          VirtualDisplayResponseType.OBJECT_TREE,
          handler
        );
      }

      const startTime = performance.now();

      // Send many messages
      for (let i = 0; i < 1000; i++) {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: VirtualDisplayResponseType.OBJECT_TREE,
              context: { tree: `tree_${i}` },
            },
          })
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should process all messages quickly
      expect(totalTime).toBeLessThan(1000); // < 1 second for 1000 messages

      // All handlers should have been called
      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledTimes(1000);
      });

      // Clean up
      document.body.removeChild(testIframe);
    });

    it('should handle concurrent async operations efficiently', async () => {
      // Create a fresh iframe for this test
      const testIframe = document.createElement('iframe');
      testIframe.id = 'perf-async-test-iframe';
      document.body.appendChild(testIframe);

      const testClient = new VirtualDisplayClient(testIframe);
      testIframe.dispatchEvent(new Event('load'));

      const startTime = performance.now();

      // Make many concurrent requests
      const promises = Array.from({ length: 100 }, (_, i) =>
        testClient.requestObjectTree(`origin_${i}`)
      );

      // Simulate responses arriving out of order
      for (let i = 99; i >= 0; i--) {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: VirtualDisplayResponseType.OBJECT_TREE,
              context: { origin: `origin_${i}`, tree: `tree_${i}` },
            },
          })
        );
      }

      // Wait for all promises
      const results = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete efficiently
      expect(totalTime).toBeLessThan(500); // < 500ms for 100 concurrent operations

      // All results should be received
      expect(results.length).toBe(100);
      results.forEach((result, index) => {
        expect(result.context.origin).toBe(`origin_${index}`);
      });

      // Clean up
      document.body.removeChild(testIframe);
    });
  });

  describe('Memory-efficient operations', () => {
    it('should not create excessive objects during state updates', () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Track object creation indirectly through postMessage calls
      let messagesSent = 0;
      mockPostMessage.mockImplementation(() => {
        messagesSent++;
      });

      // Send many updates with same structure
      const baseState = {
        attributes: [
          {
            name: 'Memory Test',
            values: [
              {
                value: 'Base Value',
                identifiers: ['base'],
                isSelected: true,
              },
            ],
          },
        ],
      };

      // Send the same state many times
      for (let i = 0; i < 10000; i++) {
        client.sendClientState(baseState);
      }

      // All messages should be sent
      expect(messagesSent).toBe(10000);

      // Memory test: can still perform operations
      client.sendClientState({
        attributes: [
          {
            name: 'Final Test',
            values: [],
          },
        ],
      });

      expect(messagesSent).toBe(10001);
    });

    it('should handle deep object nesting without stack overflow', () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Create deeply nested state
      const createNestedState = (depth: number): unknown => {
        if (depth === 0) {
          return {
            value: 'Leaf Node',
            identifiers: ['leaf'],
            isSelected: true,
          };
        }

        return {
          name: `Level ${depth}`,
          values: [createNestedState(depth - 1)],
        };
      };

      const deepState = {
        attributes: [createNestedState(100)], // 100 levels deep
      };

      // Should handle without stack overflow
      expect(() => {
        client.sendClientState(deepState);
      }).not.toThrow();

      expect(mockPostMessage).toHaveBeenCalled();
    });
  });

  describe('Queue performance', () => {
    it('should efficiently queue messages before iframe load', () => {
      client = new VirtualDisplayClient(iframe);

      const startTime = performance.now();

      // Queue many messages
      for (let i = 0; i < 10000; i++) {
        client.sendClientState({
          attributes: [
            {
              name: `Queue Test ${i}`,
              values: [],
            },
          ],
        });
      }

      const queueTime = performance.now() - startTime;

      // Queuing should be fast
      expect(queueTime).toBeLessThan(100); // < 100ms to queue 10k messages

      // No messages sent yet
      expect(mockPostMessage).not.toHaveBeenCalled();

      // Flush queue
      const flushStart = performance.now();
      iframe.dispatchEvent(new Event('load'));
      const flushTime = performance.now() - flushStart;

      // Flushing should also be reasonably fast
      expect(flushTime).toBeLessThan(1000); // < 1s to flush 10k messages

      // All messages sent
      expect(mockPostMessage).toHaveBeenCalledTimes(10000);
    });
  });
});
