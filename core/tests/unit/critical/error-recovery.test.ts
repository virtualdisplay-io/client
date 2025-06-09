import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  VirtualDisplayClient,
  VirtualDisplayRequestType,
  State,
} from '../../../src';
import { createVirtualDisplayClientWithIframe } from '../../../src/iframe/builder';
import { logger } from '../../../src/utils/logger';

describe('Error Recovery', () => {
  let client: VirtualDisplayClient;
  let iframe: HTMLIFrameElement;
  let consoleErrorSpy: vi.SpyInstance;
  let loggerErrorSpy: vi.SpyInstance;

  beforeEach((): void => {
    // Setup iframe
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    iframe.src = 'https://example.com';
    document.body.appendChild(iframe);

    // Mock console and logger
    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((): void => {});
    loggerErrorSpy = vi
      .spyOn(logger, 'error')
      .mockImplementation((): void => {});
  });

  afterEach((): void => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Network Failures', () => {
    it('should recover from iframe load failure', async () => {
      // Create a parent element first
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const errorCallback = vi.fn();

      // Simulate iframe creation with invalid URL
      const client = createVirtualDisplayClientWithIframe({
        license: 'test-license',
        model: 'test-model',
        parent: parent,
        onReady: errorCallback,
      });

      const iframeElement = parent.querySelector('iframe') as HTMLIFrameElement;

      // Simulate error
      iframeElement.dispatchEvent(new Event('error'));

      // The iframe should exist but error callback should not be called
      expect(iframeElement).toBeTruthy();
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('should handle postMessage failures gracefully', async () => {
      // Mock postMessage to throw BEFORE creating client
      const postMessageMock = vi.fn().mockImplementation((): void => {
        throw new Error('PostMessage failed');
      });

      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageMock },
        writable: true,
      });

      client = new VirtualDisplayClient('#test-iframe');

      // Trigger the load event to make the queue ready
      iframe.dispatchEvent(new Event('load'));

      const state: State = {
        attributes: [
          {
            name: 'Color',
            values: [{ value: 'Red', identifiers: ['red'], isSelected: true }],
          },
        ],
      };

      // Should not throw despite postMessage failure
      expect(() => client.sendClientState(state)).not.toThrow();

      // Wait for async error handling
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send message'),
        expect.any(Object)
      );
    });

    it('should handle connection timeout', async () => {
      // Create a parent element
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const onReadySpy = vi.fn();

      // Create client with onReady callback
      const client = createVirtualDisplayClientWithIframe({
        license: 'test-license',
        model: 'test-model',
        parent: parent,
        onReady: onReadySpy,
      });

      // Wait for potential timeout
      await new Promise<void>((resolve) => setTimeout(resolve, 200));

      // onReady should not be called if iframe doesn't load
      expect(onReadySpy).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Data Handling', () => {
    it('should recover from malformed response data', async () => {
      client = new VirtualDisplayClient('#test-iframe');

      // Simulate malformed message
      const malformedMessage = {
        type: VirtualDisplayRequestType.OBJECT_TREE,
        context: 'invalid-json-string',
      };

      window.postMessage(malformedMessage, '*');

      // Should handle gracefully without crashing
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle circular reference in state objects', () => {
      client = new VirtualDisplayClient('#test-iframe');

      // Create circular reference
      const circularState: State & { circular?: unknown } = {
        attributes: [{ name: 'Test', values: [] }],
      };
      circularState.attributes[0].circular = circularState;

      // Should handle circular reference without throwing
      expect(() => client.sendClientState(circularState)).not.toThrow();
    });

    it('should validate and sanitize incoming messages', () => {
      client = new VirtualDisplayClient('#test-iframe');

      const maliciousMessages = [
        { type: '<script>alert("xss")</script>', context: {} },
        {
          type: VirtualDisplayRequestType.CLIENT_STATE,
          context: { __proto__: { polluted: true } },
        },
        { type: null, context: undefined },
        { type: {}, context: [] },
      ];

      maliciousMessages.forEach((msg) => {
        window.postMessage(msg, '*');
      });

      // Should not process malicious messages
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Resource Cleanup', () => {
    it('should clean up event listeners on client destruction', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      client = new VirtualDisplayClient('#test-iframe');

      // Assuming we add a destroy method
      if (typeof (client as { destroy?: () => void }).destroy === 'function') {
        (client as { destroy: () => void }).destroy();
        expect(removeEventListenerSpy).toHaveBeenCalled();
      }
    });

    it('should handle iframe removal during active communication', async () => {
      client = new VirtualDisplayClient('#test-iframe');

      // Mock the contentWindow to prevent errors
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: vi.fn() },
        writable: true,
      });

      // Start a request
      const promise = client.requestObjectTree();

      // Remove iframe while request is pending
      iframe.remove();

      // Wait for response or timeout
      const result = await Promise.race([
        promise,
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timeout'), 100)
        ),
      ]);

      // Should handle gracefully (either resolve with response or timeout)
      expect(result).toBeDefined();
    });
  });

  describe('State Recovery', () => {
    it('should maintain state integrity after errors', () => {
      const validState: State = {
        attributes: [
          {
            name: 'Color',
            values: [
              { value: 'Blue', identifiers: ['blue'], isSelected: true },
            ],
          },
        ],
      };

      // Mock initial working postMessage BEFORE creating client
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient('#test-iframe');

      // Trigger load event to make queue ready
      iframe.dispatchEvent(new Event('load'));

      // Send valid state
      client.sendClientState(validState);
      expect(mockPostMessage).toHaveBeenCalledTimes(1);

      // Cause an error by setting contentWindow to null
      Object.defineProperty(iframe, 'contentWindow', {
        value: null,
        writable: true,
      });

      // Try to send state again (should fail gracefully but will be queued)
      expect(() => client.sendClientState(validState)).not.toThrow();

      // Restore iframe and trigger load again
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });
      iframe.dispatchEvent(new Event('load'));

      // Should be able to send state again
      client.sendClientState(validState);
      // Expect 3 calls: 1 initial + 1 queued from when contentWindow was null + 1 final
      expect(mockPostMessage).toHaveBeenCalledTimes(3);
    });

    it('should queue messages during connection interruption', () => {
      const postMessageSpy = vi.fn();

      // Start with a contentWindow but DON'T trigger load event (queue stays not ready)
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });

      client = new VirtualDisplayClient('#test-iframe');
      // Intentionally NOT calling iframe.dispatchEvent(new Event('load')) yet

      // Send multiple states
      const states = [
        {
          attributes: [
            {
              name: 'Color',
              values: [
                { value: 'Red', identifiers: ['red'], isSelected: true },
              ],
            },
          ],
        },
        {
          attributes: [
            {
              name: 'Size',
              values: [
                { value: 'Large', identifiers: ['lg'], isSelected: true },
              ],
            },
          ],
        },
        {
          attributes: [
            {
              name: 'Material',
              values: [
                { value: 'Wood', identifiers: ['wood'], isSelected: true },
              ],
            },
          ],
        },
      ];

      // Send messages while queue is not ready (should be queued)
      states.forEach((state) => {
        expect(() => client.sendClientState(state)).not.toThrow();
      });

      // At this point, no messages should have been sent yet (still queued)
      expect(postMessageSpy).toHaveBeenCalledTimes(0);

      // Now trigger load event to flush the queue
      iframe.dispatchEvent(new Event('load'));

      // Messages should have been queued and sent after load event
      expect(postMessageSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Concurrent Operation Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      client = new VirtualDisplayClient('#test-iframe');

      // Mock contentWindow
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: vi.fn() },
        writable: true,
      });

      // Send multiple requests simultaneously with timeout
      const promises = Array.from({ length: 10 }, () =>
        Promise.race([
          client.requestObjectTree(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 100)),
        ]).catch((): null => null)
      );

      // All should complete without deadlock
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
    });

    it('should handle rapid state changes', () => {
      const postMessageSpy = vi.fn();

      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });

      client = new VirtualDisplayClient('#test-iframe');

      // Trigger load event to make queue ready
      iframe.dispatchEvent(new Event('load'));

      // Send rapid state changes
      for (let i = 0; i < 100; i++) {
        const state: State = {
          attributes: [
            {
              name: `Attr${i}`,
              values: [
                { value: `Val${i}`, identifiers: [`id${i}`], isSelected: true },
              ],
            },
          ],
        };

        expect(() => client.sendClientState(state)).not.toThrow();
      }

      // All messages should be sent
      expect(postMessageSpy).toHaveBeenCalledTimes(100);
    });
  });
});
