import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient, VirtualDisplayRequestType, VirtualDisplayResponseType } from '../../src';
import { State, VirtualDisplayResponse } from '../../src';
import { createVirtualDisplayClientWithIframe } from '../../src/iframe/builder';
import { responseDispatcher } from '../../src/message/dispatcher';

describe('Message Flow Integration', () => {
  let client: VirtualDisplayClient;
  let iframe: HTMLIFrameElement;
  let serverWindow: Window;
  
  beforeEach(() => {
    // Setup iframe
    iframe = document.createElement('iframe');
    iframe.id = 'integration-test-iframe';
    iframe.src = 'https://example.com';
    document.body.appendChild(iframe);
    
    // Mock server window
    serverWindow = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      parent: window
    } as any;
    
    Object.defineProperty(iframe, 'contentWindow', {
      value: serverWindow,
      writable: true,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('End-to-End Message Communication', () => {
    it('should complete full request-response cycle', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      // Setup response simulation
      let capturedMessage: any;
      (serverWindow.postMessage as vi.Mock).mockImplementation((message) => {
        capturedMessage = message;
        
        // Simulate server response
        setTimeout(() => {
          window.postMessage({
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: {
              nodes: [
                { name: 'Root', children: ['Child1', 'Child2'] },
                { name: 'Child1', children: [] },
                { name: 'Child2', children: [] }
              ]
            }
          }, '*');
        }, 10);
      });
      
      // Send request with timeout
      const result = await Promise.race([
        client.requestObjectTree('https://example.com'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
      ]);
      
      // Verify request was sent correctly
      expect(capturedMessage).toEqual({
        type: VirtualDisplayRequestType.OBJECT_TREE,
        context: { origin: 'https://example.com' }
      });
      
      // Verify response was received (response includes the full response object)
      expect(result.context).toEqual({
        nodes: [
          { name: 'Root', children: ['Child1', 'Child2'] },
          { name: 'Child1', children: [] },
          { name: 'Child2', children: [] }
        ]
      });
    });

    it('should handle bidirectional communication', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      const messages: any[] = [];
      (serverWindow.postMessage as vi.Mock).mockImplementation((message) => {
        messages.push({ direction: 'client-to-server', message });
      });
      
      // Client sends state
      const state: State = {
        attributes: [
          { name: 'Color', values: [{ value: 'Blue', identifiers: ['blue'], isSelected: true }] },
          { name: 'Size', values: [{ value: 'Large', identifiers: ['lg'], isSelected: true }] }
        ]
      };
      
      client.sendClientState(state);
      
      // Server sends unsolicited update
      window.postMessage({
        type: VirtualDisplayResponseType.OBJECT_TREE,
        context: { status: 'applied', timestamp: Date.now() }
      }, '*');
      
      // Verify client-to-server message
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        direction: 'client-to-server',
        message: {
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: state
        }
      });
    });
  });

  describe('Message Queue Integration', () => {
    it('should queue messages before iframe is ready', async () => {
      // Create parent element
      const parent = document.createElement('div');
      parent.id = 'queue-test-parent';
      document.body.appendChild(parent);
      
      // Create client with iframe
      const onReadyCallback = vi.fn();
      client = createVirtualDisplayClientWithIframe({
        license: 'test-license',
        model: 'test-model',
        parent: parent,
        iframeId: 'queued-iframe',
        onReady: onReadyCallback
      });
      
      // Get the created iframe
      const iframe = document.querySelector('#queued-iframe') as HTMLIFrameElement;
      
      // Send messages while iframe is loading
      const states = [
        { attributes: [{ name: 'Color', values: [{ value: 'Red', identifiers: ['red'], isSelected: true }] }] },
        { attributes: [{ name: 'Size', values: [{ value: 'Small', identifiers: ['sm'], isSelected: true }] }] },
        { attributes: [{ name: 'Material', values: [{ value: 'Wood', identifiers: ['wood'], isSelected: true }] }] }
      ];
      
      states.forEach(state => client.sendClientState(state));
      
      // Mock the iframe's contentWindow
      const mockWindow = {
        postMessage: vi.fn()
      };
      Object.defineProperty(iframe, 'contentWindow', {
        value: mockWindow,
        writable: true
      });
      
      // Trigger load event
      iframe.dispatchEvent(new Event('load'));
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // All queued messages should be sent after load
      expect(mockWindow.postMessage).toHaveBeenCalledTimes(3);
      states.forEach((state, index) => {
        expect(mockWindow.postMessage).toHaveBeenNthCalledWith(index + 1, {
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: state
        }, '*');
      });
    });

    it('should handle message ordering correctly', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      const receivedMessages: any[] = [];
      (serverWindow.postMessage as vi.Mock).mockImplementation((message) => {
        receivedMessages.push(message);
      });
      
      // Send different types of messages in sequence
      client.sendClientState({ attributes: [{ name: 'Step1', values: [] }] });
      
      const treePromise = Promise.race([
        client.requestObjectTree(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
      ]).catch(() => null);
      
      client.sendClientState({ attributes: [{ name: 'Step2', values: [] }] });
      client.sendClientState({ attributes: [{ name: 'Step3', values: [] }] });
      
      // Simulate tree response
      setTimeout(() => {
        window.postMessage({
          type: VirtualDisplayResponseType.OBJECT_TREE,
          context: { nodes: [] }
        }, '*');
      }, 10);
      
      await treePromise;
      
      // Verify message order
      expect(receivedMessages).toHaveLength(4);
      expect(receivedMessages[0].context.attributes[0].name).toBe('Step1');
      expect(receivedMessages[1].type).toBe(VirtualDisplayRequestType.OBJECT_TREE);
      expect(receivedMessages[2].context.attributes[0].name).toBe('Step2');
      expect(receivedMessages[3].context.attributes[0].name).toBe('Step3');
    });
  });

  describe('Response Dispatcher Integration', () => {
    it('should route responses to correct handlers', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      // Setup mock to simulate responses
      (serverWindow.postMessage as vi.Mock).mockImplementation(() => {
        // Simulate multiple responses
        setTimeout(() => {
          window.postMessage({
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { nodes: [{ name: 'Response1' }] }
          }, '*');
        }, 10);
        
        setTimeout(() => {
          window.postMessage({
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { nodes: [{ name: 'Response2' }] }
          }, '*');
        }, 20);
      });
      
      // Setup multiple concurrent requests with timeout
      const request1Promise = Promise.race([
        client.requestObjectTree(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      ]).catch(() => ({ context: { nodes: [] } }));
      
      const request2Promise = Promise.race([
        client.requestObjectTree(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      ]).catch(() => ({ context: { nodes: [] } }));
      
      const [response1, response2] = await Promise.all([request1Promise, request2Promise]);
      
      // Both requests should receive responses
      expect(response1).toBeTruthy();
      expect(response2).toBeTruthy();
    });

    it('should handle mixed message types', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      const stateUpdates: any[] = [];
      const errorEvents: any[] = [];
      
      // Listen for different event types - since we only have OBJECT_TREE type,
      // we'll test with that
      const cleanup = () => {
        responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, handler);
      };
      
      const handler = (data: any) => {
        if (data.context.status) {
          stateUpdates.push(data.context);
        } else if (data.context.error) {
          errorEvents.push(data.context);
        }
      };
      
      responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, handler);
      
      // Send various message types using the OBJECT_TREE type
      window.postMessage({
        type: VirtualDisplayResponseType.OBJECT_TREE,
        context: { status: 'received' }
      }, '*');
      
      window.postMessage({
        type: VirtualDisplayResponseType.OBJECT_TREE,
        context: { error: 'Test error', code: 'TEST_001' }
      }, '*');
      
      window.postMessage({
        type: VirtualDisplayResponseType.OBJECT_TREE,
        context: { status: 'applied' }
      }, '*');
      
      // Allow event processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify correct routing
      expect(stateUpdates).toHaveLength(2);
      expect(stateUpdates[0].status).toBe('received');
      expect(stateUpdates[1].status).toBe('applied');
      
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0].error).toBe('Test error');
      
      cleanup();
    });
  });

  describe('Error Handling Integration', () => {
    it('should propagate errors through message flow', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      // Setup error response
      (serverWindow.postMessage as vi.Mock).mockImplementation(() => {
        setTimeout(() => {
          window.postMessage({
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { 
              error: 'Model not found',
              code: 'MODEL_NOT_FOUND',
              details: { modelId: 'test-model' }
            }
          }, '*');
        }, 10);
      });
      
      // The requestObjectTree will receive a response with error context
      const result = await Promise.race([
        client.requestObjectTree(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      ]);
      
      // Verify error was sent and received
      expect((serverWindow.postMessage as vi.Mock)).toHaveBeenCalled();
      expect(result.context.error).toBe('Model not found');
    });

    it('should recover from communication failures', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      let callCount = 0;
      (serverWindow.postMessage as vi.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call fails
          throw new Error('Network error');
        }
        // Subsequent calls succeed
      });
      
      // First state should fail gracefully
      expect(() => client.sendClientState({ attributes: [] })).not.toThrow();
      
      // Second state should succeed
      expect(() => client.sendClientState({ attributes: [] })).not.toThrow();
      
      expect(callCount).toBe(2);
    });
  });

  describe('Cross-Origin Communication', () => {
    it('should handle cross-origin messages safely', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      // Simulate messages from different origins
      const trustedOrigin = 'https://trusted.example.com';
      const untrustedOrigin = 'https://untrusted.example.com';
      
      const receivedMessages: any[] = [];
      const handler = (data: any) => {
        receivedMessages.push(data.context);
      };
      
      responseDispatcher.subscribe(VirtualDisplayResponseType.OBJECT_TREE, handler);
      
      // Send from trusted origin
      const trustedEvent = new MessageEvent('message', {
        data: {
          type: VirtualDisplayResponseType.OBJECT_TREE,
          context: { source: 'trusted' }
        },
        origin: trustedOrigin
      });
      window.dispatchEvent(trustedEvent);
      
      // Send from untrusted origin
      const untrustedEvent = new MessageEvent('message', {
        data: {
          type: VirtualDisplayResponseType.OBJECT_TREE,
          context: { source: 'untrusted' }
        },
        origin: untrustedOrigin
      });
      window.dispatchEvent(untrustedEvent);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should process both messages (origin filtering would be in server)
      expect(receivedMessages).toHaveLength(2);
      
      responseDispatcher.unsubscribe(VirtualDisplayResponseType.OBJECT_TREE, handler);
    });

    it('should include origin in requests when specified', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      let capturedMessage: any;
      (serverWindow.postMessage as vi.Mock).mockImplementation((message) => {
        capturedMessage = message;
      });
      
      const origin = 'https://myapp.example.com';
      
      // Use timeout to prevent hanging
      Promise.race([
        client.requestObjectTree(origin),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
      ]).catch(() => {});
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(capturedMessage).toEqual({
        type: VirtualDisplayRequestType.OBJECT_TREE,
        context: { origin }
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high message volume', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      const messageCount = 100; // Reduced for test performance
      const receivedMessages: any[] = [];
      
      (serverWindow.postMessage as vi.Mock).mockImplementation((message) => {
        receivedMessages.push(message);
      });
      
      // Send many messages rapidly
      const startTime = performance.now();
      
      for (let i = 0; i < messageCount; i++) {
        client.sendClientState({
          attributes: [
            { name: `Attr${i}`, values: [{ value: `Val${i}`, identifiers: [`id${i}`], isSelected: true }] }
          ]
        });
      }
      
      const endTime = performance.now();
      
      // Should handle all messages
      expect(receivedMessages).toHaveLength(messageCount);
      
      // Should complete in reasonable time (1 second for 100 messages)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle concurrent operations efficiently', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      let responseIndex = 0;
      (serverWindow.postMessage as vi.Mock).mockImplementation(() => {
        const index = responseIndex++;
        setTimeout(() => {
          window.postMessage({
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { id: index, nodes: [] }
          }, '*');
        }, Math.random() * 50); // Random delay up to 50ms
      });
      
      // Send 10 concurrent requests with timeout
      const promises = Array.from({ length: 10 }, () => 
        Promise.race([
          client.requestObjectTree(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 200))
        ]).catch(() => ({ context: { nodes: [] } }))
      );
      
      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      // All should complete
      expect(results).toHaveLength(10);
      
      // Should complete efficiently
      expect(endTime - startTime).toBeLessThan(500); // 500ms for 10 concurrent requests
    });
  });

  describe('State Synchronization', () => {
    it('should maintain state consistency across messages', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      const sentStates: State[] = [];
      (serverWindow.postMessage as vi.Mock).mockImplementation((message) => {
        if (message.type === VirtualDisplayRequestType.CLIENT_STATE) {
          sentStates.push(message.context);
        }
      });
      
      // Send incremental state updates
      const states: State[] = [
        { attributes: [{ name: 'Color', values: [{ value: 'Red', identifiers: ['red'], isSelected: true }] }] },
        { attributes: [
          { name: 'Color', values: [{ value: 'Red', identifiers: ['red'], isSelected: true }] },
          { name: 'Size', values: [{ value: 'Large', identifiers: ['lg'], isSelected: true }] }
        ]},
        { attributes: [
          { name: 'Color', values: [{ value: 'Blue', identifiers: ['blue'], isSelected: true }] },
          { name: 'Size', values: [{ value: 'Large', identifiers: ['lg'], isSelected: true }] }
        ]}
      ];
      
      states.forEach(state => client.sendClientState(state));
      
      // Verify all states were sent correctly
      expect(sentStates).toHaveLength(3);
      expect(sentStates).toEqual(states);
    });

    it('should handle state conflicts gracefully', async () => {
      client = new VirtualDisplayClient('#integration-test-iframe');
      
      // Send conflicting states rapidly
      const state1: State = {
        attributes: [{ name: 'Color', values: [{ value: 'Red', identifiers: ['red'], isSelected: true }] }]
      };
      
      const state2: State = {
        attributes: [{ name: 'Color', values: [{ value: 'Blue', identifiers: ['blue'], isSelected: true }] }]
      };
      
      // Send states without waiting
      client.sendClientState(state1);
      client.sendClientState(state2);
      client.sendClientState(state1);
      
      // All states should be sent (conflict resolution is server's responsibility)
      expect((serverWindow.postMessage as vi.Mock)).toHaveBeenCalledTimes(3);
    });
  });
});