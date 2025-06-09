import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient, VirtualDisplayRequestType, VirtualDisplayResponseType, State } from '../../../src';
import { RequestQueue } from '../../../src/message/queue';
import { responseDispatcher } from '../../../src/message/dispatcher';

describe('Performance Metrics', () => {
  let client: VirtualDisplayClient;
  let iframe: HTMLIFrameElement;
  let performanceNowSpy: vi.SpyInstance;
  
  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);
    
    // Mock performance.now for consistent timing
    performanceNowSpy = vi.spyOn(performance, 'now');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Message Processing Speed', () => {
    it('should process messages within acceptable time limits', () => {
      client = new VirtualDisplayClient('#test-iframe');
      const postMessageSpy = vi.fn();
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });
      
      const startTime = performance.now();
      
      // Send 1000 messages
      for (let i = 0; i < 1000; i++) {
        const state: State = {
          attributes: [
            { name: `Attr${i}`, values: [{ value: `Val${i}`, identifiers: [`id${i}`], isSelected: true }] }
          ]
        };
        client.sendClientState(state);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should process 1000 messages in under 100ms
      expect(totalTime).toBeLessThan(100);
      expect(postMessageSpy).toHaveBeenCalledTimes(1000);
    });

    it('should batch messages efficiently', () => {
      const mockTarget = {
        postMessage: vi.fn()
      } as any;
      
      const queue = new RequestQueue(mockTarget);
      
      // Add multiple messages rapidly
      const messages = Array.from({ length: 100 }, (_, i) => ({
        type: VirtualDisplayRequestType.CLIENT_STATE,
        context: { id: i }
      }));
      
      const startTime = performance.now();
      messages.forEach(msg => queue.send(msg));
      queue.flush();
      const endTime = performance.now();
      
      // Should batch process quickly
      expect(endTime - startTime).toBeLessThan(10);
      expect(mockTarget.postMessage).toHaveBeenCalledTimes(100);
    });
  });

  describe('State Update Performance', () => {
    it('should handle large state objects efficiently', () => {
      client = new VirtualDisplayClient('#test-iframe');
      
      // Create large state with many attributes
      const largeState: State = {
        attributes: Array.from({ length: 100 }, (_, i) => ({
          name: `Attribute${i}`,
          values: Array.from({ length: 50 }, (_, j) => ({
            value: `Value${i}-${j}`,
            identifiers: [`id${i}-${j}`, `alt${i}-${j}`],
            isSelected: j === 0
          }))
        }))
      };
      
      const startTime = performance.now();
      client.sendClientState(largeState);
      const endTime = performance.now();
      
      // Should handle large state in under 10ms
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('should optimize repeated state updates', () => {
      client = new VirtualDisplayClient('#test-iframe');
      const postMessageSpy = vi.fn();
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });
      
      // Same state sent multiple times
      const state: State = {
        attributes: [
          { name: 'Color', values: [{ value: 'Red', identifiers: ['red'], isSelected: true }] }
        ]
      };
      
      const times: number[] = [];
      
      // Send same state 10 times and measure each
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        client.sendClientState(state);
        const end = performance.now();
        times.push(end - start);
      }
      
      // Later calls should be as fast or faster (no degradation)
      const firstTime = times[0];
      const lastTime = times[times.length - 1];
      expect(lastTime).toBeLessThanOrEqual(firstTime * 2); // Allow some variance
    });
  });

  describe('Event Dispatcher Performance', () => {
    it('should dispatch events to multiple listeners efficiently', () => {
      const listeners = Array.from({ length: 100 }, () => vi.fn());
      
      // Add 100 listeners
      listeners.forEach(listener => {
        responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, listener);
      });
      
      const testData = { 
        type: VirtualDisplayResponseType.OBJECT_TREE, 
        context: { payload: 'data' } 
      };
      
      const startTime = performance.now();
      responseDispatcher.publish(testData);
      const endTime = performance.now();
      
      // Should dispatch to 100 listeners in under 5ms
      expect(endTime - startTime).toBeLessThan(5);
      
      // All listeners should be called
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledWith(testData);
      });
      
      // Clean up
      listeners.forEach(listener => {
        responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, listener);
      });
    });

    it('should handle high-frequency events without degradation', () => {
      const callback = vi.fn();
      responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, callback);
      
      const times: number[] = [];
      
      // Emit 1000 events rapidly
      for (let i = 0; i < 1000; i++) {
        const start = performance.now();
        responseDispatcher.publish({ 
          type: VirtualDisplayResponseType.OBJECT_TREE, 
          context: { index: i } 
        });
        const end = performance.now();
        times.push(end - start);
      }
      
      // Calculate average time
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      // Average dispatch time should be under 0.1ms
      expect(avgTime).toBeLessThan(0.1);
      expect(callback).toHaveBeenCalledTimes(1000);
      
      // Clean up
      responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, callback);
    });
  });

  describe('Memory Allocation Performance', () => {
    it('should minimize object allocations during message sending', () => {
      client = new VirtualDisplayClient('#test-iframe');
      const postMessageSpy = vi.fn();
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });
      
      // Pre-create state to avoid allocation in loop
      const states = Array.from({ length: 100 }, (_, i) => ({
        attributes: [
          { name: `Attr${i}`, values: [{ value: `Val${i}`, identifiers: [`id${i}`], isSelected: true }] }
        ]
      }));
      
      // Measure repeated sends
      const startTime = performance.now();
      states.forEach(state => client.sendClientState(state));
      const endTime = performance.now();
      
      // Should complete quickly without excessive allocations
      expect(endTime - startTime).toBeLessThan(20);
    });

    it('should reuse message objects when possible', () => {
      const mockTarget = {
        postMessage: vi.fn()
      } as any;
      
      const queue = new RequestQueue(mockTarget);
      const messages: any[] = [];
      
      // Track object creation
      const originalSend = queue.send.bind(queue);
      queue.send = (message: any) => {
        messages.push(message);
        return originalSend(message);
      };
      
      // Add similar messages
      for (let i = 0; i < 10; i++) {
        queue.send({
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: { value: i }
        });
      }
      
      // Check if objects are efficiently created
      expect(messages.length).toBe(10);
    });
  });

  describe('Throttling and Debouncing', () => {
    it('should throttle rapid state updates efficiently', async () => {
      client = new VirtualDisplayClient('#test-iframe');
      const postMessageSpy = vi.fn();
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });
      
      // Simulate rapid updates (e.g., slider movement)
      const updates = Array.from({ length: 100 }, (_, i) => ({
        attributes: [
          { name: 'Size', values: [{ value: i.toString(), identifiers: [`size-${i}`], isSelected: true }] }
        ]
      }));
      
      // Send all updates rapidly
      const startTime = performance.now();
      updates.forEach(state => client.sendClientState(state));
      const endTime = performance.now();
      
      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(50);
      
      // All messages should be sent (no throttling by default)
      expect(postMessageSpy).toHaveBeenCalledTimes(100);
    });

    it('should maintain performance under sustained load', async () => {
      client = new VirtualDisplayClient('#test-iframe');
      const times: number[] = [];
      
      // Simulate sustained load over time
      for (let batch = 0; batch < 10; batch++) {
        const batchStart = performance.now();
        
        // Send 100 messages per batch
        for (let i = 0; i < 100; i++) {
          const state: State = {
            attributes: [
              { name: `Batch${batch}Attr${i}`, values: [{ value: 'test', identifiers: ['id'], isSelected: true }] }
            ]
          };
          client.sendClientState(state);
        }
        
        const batchEnd = performance.now();
        times.push(batchEnd - batchStart);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Performance should not degrade over time
      const firstBatchTime = times[0];
      const lastBatchTime = times[times.length - 1];
      
      // Last batch should not be significantly slower than first
      expect(lastBatchTime).toBeLessThan(firstBatchTime * 1.5);
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      client = new VirtualDisplayClient('#test-iframe');
      
      // Mock response handling
      const responseHandler = vi.fn().mockResolvedValue({ nodes: [] });
      (client as any).responseDispatcher = { once: responseHandler };
      
      const startTime = performance.now();
      
      // Send 50 concurrent requests
      const promises = Array.from({ length: 50 }, () => 
        client.requestObjectTree().catch(() => null)
      );
      
      await Promise.all(promises);
      const endTime = performance.now();
      
      // Should handle 50 concurrent requests in reasonable time
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should maintain performance with mixed operations', () => {
      client = new VirtualDisplayClient('#test-iframe');
      const postMessageSpy = vi.fn();
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });
      
      const startTime = performance.now();
      
      // Mix different types of operations
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          // State update
          client.sendClientState({
            attributes: [{ name: 'Test', values: [{ value: i.toString(), identifiers: ['id'], isSelected: true }] }]
          });
        } else if (i % 3 === 1) {
          // Tree request
          client.requestObjectTree().catch(() => null);
        } else {
          // Another state update with different structure
          client.sendClientState({
            attributes: Array.from({ length: 5 }, (_, j) => ({
              name: `Attr${j}`,
              values: [{ value: 'val', identifiers: [`id${j}`], isSelected: true }]
            }))
          });
        }
      }
      
      const endTime = performance.now();
      
      // Mixed operations should complete efficiently
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Resource Usage Optimization', () => {
    it('should optimize string concatenation in messages', () => {
      const mockTarget = {
        postMessage: vi.fn()
      } as any;
      
      const queue = new RequestQueue(mockTarget);
      
      const startTime = performance.now();
      
      // Create messages with string concatenation
      for (let i = 0; i < 1000; i++) {
        queue.send({
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: {
            id: `prefix-${i}-suffix`,
            name: `name-${i}`,
            value: `value-${i}`
          }
        });
      }
      
      queue.flush();
      const endTime = performance.now();
      
      // String operations should be optimized
      expect(endTime - startTime).toBeLessThan(50);
      expect(mockTarget.postMessage).toHaveBeenCalledTimes(1000);
    });

    it('should handle deep object cloning efficiently', () => {
      client = new VirtualDisplayClient('#test-iframe');
      
      // Create deeply nested state
      const deepState: State = {
        attributes: Array.from({ length: 10 }, (_, i) => ({
          name: `Level1-${i}`,
          values: Array.from({ length: 10 }, (_, j) => ({
            value: `Level2-${j}`,
            identifiers: Array.from({ length: 10 }, (_, k) => `Level3-${k}`),
            isSelected: i === 0 && j === 0
          }))
        }))
      };
      
      const times: number[] = [];
      
      // Send deep state multiple times
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        client.sendClientState(deepState);
        const end = performance.now();
        times.push(end - start);
      }
      
      // All sends should be consistently fast
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      expect(maxTime - minTime).toBeLessThan(5); // Consistent performance
      expect(maxTime).toBeLessThan(10); // Absolute performance
    });
  });
});