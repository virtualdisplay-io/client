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
import { logger } from '../../../src/utils/logger';

describe('Error Recovery Scenarios', () => {
  let client: VirtualDisplayClient;
  let iframe: HTMLIFrameElement;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);

    // Spy on logger methods
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});

    originalConsoleError = console.error;
    console.error = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(iframe);
    vi.clearAllMocks();
    console.error = originalConsoleError;
  });

  describe('Iframe loading failures', () => {
    it('should handle iframe that never loads', async () => {
      // Create client with iframe that won't load
      client = new VirtualDisplayClient(iframe);

      // Send state update
      client.sendClientState({
        attributes: [
          {
            name: 'Test',
            values: [
              { value: 'Value', identifiers: ['test'], isSelected: true },
            ],
          },
        ],
      });

      // Request should be queued
      const requestPromise = client.requestObjectTree();

      // Simulate timeout waiting for response
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 100)
      );

      // Should timeout rather than hang forever
      await expect(
        Promise.race([requestPromise, timeoutPromise])
      ).rejects.toThrow('Timeout');
    });

    it('should handle iframe src change during operation', () => {
      client = new VirtualDisplayClient(iframe);

      // Send initial state
      client.sendClientState({ attributes: [] });

      // Change iframe src (simulating navigation)
      iframe.src = 'https://different-origin.com';

      // Should still be able to send messages (they'll queue)
      expect(() => {
        client.sendClientState({ attributes: [] });
      }).not.toThrow();
    });

    it('should recover from iframe reload', () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);

      // Initial load
      iframe.dispatchEvent(new Event('load'));

      // Send message
      client.sendClientState({ attributes: [] });
      expect(mockPostMessage).toHaveBeenCalledTimes(1);

      // Note: The RequestQueue keeps a reference to the initial contentWindow
      // In a real scenario, a new VirtualDisplayClient would need to be created
      // after iframe reload to get the new contentWindow reference

      // Create new client with reloaded iframe
      const newMockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: newMockPostMessage },
        writable: true,
      });

      const newClient = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // New client should use new contentWindow
      newClient.sendClientState({ attributes: [] });
      expect(newMockPostMessage).toHaveBeenCalled();
    });
  });

  describe('Message handling errors', () => {
    it('should handle postMessage throwing errors', () => {
      const errorMessage = 'Cannot post message to cross-origin iframe';
      const mockPostMessage = vi.fn().mockImplementation(() => {
        throw new Error(errorMessage);
      });

      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Should not throw when sending message
      expect(() => {
        client.sendClientState({ attributes: [] });
      }).not.toThrow();

      // Error should be logged
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send message'),
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    it('should handle contentWindow being null after load', () => {
      client = new VirtualDisplayClient(iframe);

      // Simulate contentWindow becoming null (iframe removed from DOM)
      Object.defineProperty(iframe, 'contentWindow', {
        value: null,
        writable: true,
      });

      iframe.dispatchEvent(new Event('load'));

      // Should handle gracefully
      expect(() => {
        client.sendClientState({ attributes: [] });
      }).not.toThrow();
    });
  });

  describe('Response handling errors', () => {
    it('should handle malformed response data', () => {
      client = new VirtualDisplayClient(iframe);
      const handler = vi.fn();

      client.onResponseSubscriber(
        VirtualDisplayResponseType.OBJECT_TREE,
        handler
      );

      // Send various malformed messages
      const malformedMessages = [
        { data: null },
        { data: undefined },
        { data: 'string' },
        { data: 123 },
        { data: { type: null } },
        { data: { type: 'INVALID_TYPE' } },
        { data: { type: 123 } },
        { data: { type: true } },
        { data: { type: {} } },
        { data: { type: [] } },
      ];

      malformedMessages.forEach((msg) => {
        window.dispatchEvent(new MessageEvent('message', msg));
      });

      // Handler should not be called because none of these have a valid VirtualDisplayResponseType
      expect(handler).not.toHaveBeenCalled();

      // Current implementation accepts messages with valid types
      // even without context
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
          },
        })
      );

      expect(handler).toHaveBeenCalledOnce();

      // Reset handler
      handler.mockClear();

      // Also accepts with context
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
            context: { tree: null },
          },
        })
      );

      expect(handler).toHaveBeenCalledOnce();
    });

    it('should handle response timeout for requestObjectTree', async () => {
      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Make request but never send response
      const requestPromise = client.requestObjectTree();

      // Create timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Response timeout')), 100)
      );

      await expect(
        Promise.race([requestPromise, timeoutPromise])
      ).rejects.toThrow('Response timeout');
    });
  });

  describe('State corruption recovery', () => {
    it('should handle sending extremely large state objects', () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Create very large state object
      const largeState = {
        attributes: Array.from({ length: 10000 }, (_, i) => ({
          name: `Attribute${i}`,
          values: Array.from({ length: 100 }, (_, j) => ({
            value: `Value${j}`,
            identifiers: [`id${i}-${j}`],
            isSelected: j === 0,
          })),
        })),
      };

      // Should handle without crashing
      expect(() => {
        client.sendClientState(largeState);
      }).not.toThrow();

      expect(mockPostMessage).toHaveBeenCalled();
    });

    it('should handle circular references in state objects', () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);
      iframe.dispatchEvent(new Event('load'));

      // Create circular reference
      const circularState: Record<string, unknown> = {
        attributes: [
          {
            name: 'Test',
            values: [],
          },
        ],
      };
      (circularState.attributes as Array<Record<string, unknown>>)[0].circular =
        circularState;

      // Should handle without crashing (postMessage should handle it)
      expect(() => {
        client.sendClientState(circularState);
      }).not.toThrow();
    });
  });

  describe('Event listener cleanup', () => {
    it('should prevent duplicate event listeners on multiple load events', () => {
      const mockPostMessage = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      });

      client = new VirtualDisplayClient(iframe);

      // Queue messages before load
      client.sendClientState({ attributes: [] });
      client.sendClientState({ attributes: [] });

      // Trigger multiple load events
      iframe.dispatchEvent(new Event('load'));
      iframe.dispatchEvent(new Event('load'));
      iframe.dispatchEvent(new Event('load'));

      // Should only flush queue once
      expect(mockPostMessage).toHaveBeenCalledTimes(2);
    });

    it('should handle window message events after iframe is removed', () => {
      client = new VirtualDisplayClient(iframe);
      const handler = vi.fn();

      client.onResponseSubscriber(
        VirtualDisplayResponseType.OBJECT_TREE,
        handler
      );

      // Send message event with valid type
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
          },
        })
      );

      // Should handle message
      expect(handler).toHaveBeenCalled();

      // Remove iframe from DOM
      document.body.removeChild(iframe);

      // Create new iframe for afterEach cleanup
      iframe = document.createElement('iframe');
      iframe.id = 'test-iframe-2';
      document.body.appendChild(iframe);

      // Handler should still work after iframe removal
      handler.mockClear();
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: VirtualDisplayResponseType.OBJECT_TREE,
          },
        })
      );

      expect(handler).toHaveBeenCalled();
    });
  });
});
