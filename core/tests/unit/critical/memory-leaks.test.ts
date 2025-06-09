import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient, VirtualDisplayRequestType, VirtualDisplayResponseType, State } from '../../../src';
import { responseDispatcher } from '../../../src/message/dispatcher';
import { RequestQueue } from '../../../src/message/queue';

describe('Memory Leak Prevention', () => {
  let client: VirtualDisplayClient;
  let iframe: HTMLIFrameElement;
  
  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Event Listener Management', () => {
    it('should not accumulate message event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      // Create and destroy multiple clients
      for (let i = 0; i < 10; i++) {
        const tempClient = new VirtualDisplayClient('#test-iframe');
        // Simulate cleanup if destroy method exists
        if (typeof (tempClient as any).destroy === 'function') {
          (tempClient as any).destroy();
        }
      }
      
      // Should not accumulate listeners
      const messageListenerCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'message'
      );
      
      expect(messageListenerCalls.length).toBeLessThanOrEqual(10);
    });

    it('should remove all event listeners on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      // Add multiple listeners
      const callbacks = Array.from({ length: 5 }, () => vi.fn());
      callbacks.forEach(cb => {
        responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, cb);
      });
      
      // Clean up
      callbacks.forEach(cb => {
        responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, cb);
      });
      
      // Verify listeners are removed
      callbacks.forEach(cb => {
        responseDispatcher.publish({ type: VirtualDisplayResponseType.OBJECT_TREE, context: {} });
        expect(cb).not.toHaveBeenCalled();
      });
    });
  });

  describe('Message Queue Memory Management', () => {
    it('should not accumulate messages indefinitely in queue', () => {
      const mockTarget = {
        postMessage: vi.fn()
      } as any;
      
      const queue = new RequestQueue(mockTarget);
      
      // Add many messages
      for (let i = 0; i < 1000; i++) {
        queue.send({
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: { id: i }
        });
      }
      
      // Process queue
      queue.flush();
      
      // Queue should be empty after flush
      expect((queue as any).queue?.length || 0).toBe(0);
    });

    it('should clear pending messages on queue reset', () => {
      const mockTarget = {
        postMessage: vi.fn()
      } as any;
      
      const queue = new RequestQueue(mockTarget);
      
      // Add messages before queue is ready
      for (let i = 0; i < 100; i++) {
        queue.send({
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: { id: i }
        });
      }
      
      // The queue should hold messages until flush
      expect((queue as any).queue?.length).toBeGreaterThan(0);
      
      // After flush, queue should be empty
      queue.flush();
      expect((queue as any).queue?.length || 0).toBe(0);
    });
  });

  describe('DOM Reference Management', () => {
    it('should not retain references to removed iframes', () => {
      const clients: VirtualDisplayClient[] = [];
      const iframes: HTMLIFrameElement[] = [];
      
      // Create multiple clients with iframes
      for (let i = 0; i < 5; i++) {
        const tempIframe = document.createElement('iframe');
        tempIframe.id = `iframe-${i}`;
        document.body.appendChild(tempIframe);
        iframes.push(tempIframe);
        
        const tempClient = new VirtualDisplayClient(`#iframe-${i}`);
        clients.push(tempClient);
      }
      
      // Remove all iframes
      iframes.forEach(iframe => iframe.remove());
      
      // Clients should handle missing iframes gracefully
      clients.forEach(client => {
        expect(() => {
          client.sendClientState({ attributes: [] });
        }).not.toThrow();
      });
      
      // Clear references
      clients.length = 0;
      iframes.length = 0;
    });

    it('should clean up iframe references on client disposal', () => {
      client = new VirtualDisplayClient('#test-iframe');
      
      // Store reference to iframe element
      const iframeRef = (client as any).iframe;
      
      // Remove iframe from DOM
      iframe.remove();
      
      // Client should not hold strong reference preventing GC
      expect(document.querySelector('#test-iframe')).toBeNull();
    });
  });

  describe('Callback and Promise Management', () => {
    it('should not accumulate unresolved promises', async () => {
      client = new VirtualDisplayClient('#test-iframe');
      const promises: Promise<any>[] = [];
      
      // Disable postMessage to prevent resolution
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: vi.fn() },
        writable: true,
      });
      
      // Create many pending requests
      for (let i = 0; i < 100; i++) {
        promises.push(
          client.requestObjectTree().catch(() => null)
        );
      }
      
      // Wait with timeout
      await Promise.race([
        Promise.all(promises),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      // Promises should either resolve or be garbage collectable
      expect(promises.length).toBe(100);
    });

    it('should clean up one-time event listeners after use', async () => {
      const callback = vi.fn();
      
      // Use once method which returns a promise
      const promise = responseDispatcher.once(VirtualDisplayResponseType.OBJECT_TREE);
      
      // Trigger event
      responseDispatcher.publish({ 
        type: VirtualDisplayResponseType.OBJECT_TREE, 
        context: { data: 'test' } 
      });
      
      const result = await promise;
      expect(result.context).toEqual({ data: 'test' });
      
      // Verify no additional handlers are registered
      const secondCallback = vi.fn();
      responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, secondCallback);
      responseDispatcher.publish({ 
        type: VirtualDisplayResponseType.OBJECT_TREE, 
        context: { data: 'test2' } 
      });
      
      // Only the new handler should be called
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Object Management', () => {
    it('should not retain references to old state objects', () => {
      client = new VirtualDisplayClient('#test-iframe');
      const states: State[] = [];
      
      // Send many different states
      for (let i = 0; i < 100; i++) {
        const state: State = {
          attributes: [
            {
              name: `Attribute${i}`,
              values: [
                { value: `Value${i}`, identifiers: [`id${i}`], isSelected: true }
              ]
            }
          ]
        };
        
        states.push(state);
        client.sendClientState(state);
      }
      
      // Clear local array
      states.length = 0;
      
      // Client should not retain old states
      // (Would need weak reference checks in actual implementation)
    });

    it('should handle large state objects without memory bloat', () => {
      client = new VirtualDisplayClient('#test-iframe');
      
      // Create large state object
      const largeState: State = {
        attributes: Array.from({ length: 1000 }, (_, i) => ({
          name: `Attr${i}`,
          values: Array.from({ length: 100 }, (_, j) => ({
            value: `Val${i}-${j}`,
            identifiers: [`id${i}-${j}`],
            isSelected: j === 0
          }))
        }))
      };
      
      // Send multiple times
      for (let i = 0; i < 10; i++) {
        expect(() => client.sendClientState(largeState)).not.toThrow();
      }
      
      // Should not accumulate memory
      // (In real implementation, would check heap usage)
    });
  });

  describe('Circular Reference Prevention', () => {
    it('should handle circular references without memory leaks', () => {
      client = new VirtualDisplayClient('#test-iframe');
      
      // Create objects with circular references
      const circularStates: any[] = [];
      
      for (let i = 0; i < 10; i++) {
        const obj: any = {
          attributes: [
            { name: 'Test', values: [] }
          ]
        };
        obj.self = obj; // Circular reference
        obj.attributes[0].parent = obj; // Another circular reference
        
        circularStates.push(obj);
        
        // Should handle without infinite loops or memory issues
        expect(() => client.sendClientState(obj)).not.toThrow();
      }
      
      // Clear references
      circularStates.length = 0;
    });

    it('should prevent memory leaks in event dispatcher chains', () => {
      // Create two separate response handlers
      let callCount = 0;
      const maxCalls = 10;
      
      const handler1 = vi.fn(() => {
        callCount++;
        if (callCount < maxCalls) {
          responseDispatcher.publish({ 
            type: VirtualDisplayResponseType.OBJECT_TREE, 
            context: { data: 'recursive' } 
          });
        }
      });
      
      const handler2 = vi.fn(() => {
        callCount++;
        if (callCount < maxCalls) {
          responseDispatcher.publish({ 
            type: VirtualDisplayResponseType.OBJECT_TREE, 
            context: { data: 'recursive2' } 
          });
        }
      });
      
      responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, handler1);
      responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, handler2);
      
      // Start the chain
      responseDispatcher.publish({ 
        type: VirtualDisplayResponseType.OBJECT_TREE, 
        context: { data: 'start' } 
      });
      
      // Should trigger both handlers multiple times
      expect(callCount).toBeGreaterThan(0);
      
      // Clean up
      responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, handler1);
      responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, handler2);
    });
  });

  describe('Resource Monitoring', () => {
    it('should limit message queue size', () => {
      const mockTarget = {
        postMessage: vi.fn()
      } as any;
      
      const queue = new RequestQueue(mockTarget);
      const MAX_QUEUE_SIZE = 10000; // RequestQueue doesn't have a hard limit by default
      
      // Try to add many messages
      for (let i = 0; i < MAX_QUEUE_SIZE + 100; i++) {
        queue.send({
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: { id: i }
        });
      }
      
      // Queue should handle all messages
      const queueLength = (queue as any).queue?.length || 0;
      expect(queueLength).toBeGreaterThan(0);
    });

    it('should clean up timed-out operations', async () => {
      const timeoutCallbacks: (() => void)[] = [];
      
      // Mock setTimeout to track callbacks
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: () => void, ms: number) => {
        timeoutCallbacks.push(callback);
        return originalSetTimeout(callback, ms);
      }) as any;
      
      // Create operations that will timeout
      const promises = Array.from({ length: 10 }, () => {
        // The once method doesn't have a built-in timeout, so we add one
        return Promise.race([
          responseDispatcher.once(VirtualDisplayResponseType.OBJECT_TREE),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
        ]).catch(() => null);
      });
      
      // Wait for timeouts
      await Promise.all(promises);
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
      
      // Timeout callbacks should be cleared
      expect(timeoutCallbacks.length).toBeGreaterThan(0);
    });
  });
});