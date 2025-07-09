import { describe, it, expect, vi } from 'vitest';

import { VirtualdisplayClient, MESSAGE_TYPES, type ClientOptions } from '../../src';
import { createTestElement } from '../helpers/dom-helpers';
import { setupIframeWithLoadControl } from '../helpers/iframe-load-control';

function setupTest(): {
  parentElement: HTMLElement;
  client: VirtualdisplayClient;
  loadCallback: (() => void) | null;
  postMessageSpy: ReturnType<typeof vi.fn>;
  } {
  const parentElement = createTestElement('div');
  document.body.appendChild(parentElement);

  const options: ClientOptions = {
    parent: parentElement,
    model: 'test-model',
    license: 'test-license',
  };

  const { loadCallback, postMessageSpy } = setupIframeWithLoadControl();
  const client = new VirtualdisplayClient(options);

  return { parentElement, client, loadCallback, postMessageSpy };
}

function triggerIframeLoad(loadCallback: (() => void) | null): void {
  if (loadCallback !== null) {
    loadCallback();
  }

  const iframe = document.querySelector('iframe');
  if (iframe !== null) {
    const loadEvent = new Event('load');
    iframe.dispatchEvent(loadEvent);
  }
}

function cleanup(client: VirtualdisplayClient, parentElement: HTMLElement): void {
  client.destroy();
  document.body.removeChild(parentElement);
  vi.restoreAllMocks();
}

describe('Message Queue Race Condition Prevention', () => {
  it('should queue CONFIG messages until iframe is ready to prevent lost messages', async () => {
    // This tests a critical race condition:
    // 1. Client creates iframe
    // 2. User immediately calls viewer.setArEnabled(false)
    // 3. If we send the message now, iframe.contentWindow might be null
    // 4. Message would be lost silently
    //
    // The queue mechanism prevents this data loss
    const { parentElement, client, loadCallback, postMessageSpy } = setupTest();

    // Try to send UI config before iframe is ready
    client.viewer.setArEnabled(false);

    // Should not have sent message yet
    expect(postMessageSpy).not.toHaveBeenCalled();

    // Trigger iframe load
    triggerIframeLoad(loadCallback);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalled();
    });

    // Now message should be sent
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: MESSAGE_TYPES.CONFIG,
        config: {
          ui: {
            arEnabled: false,
          },
        },
      },
      '*',
    );

    // Cleanup
    cleanup(client, parentElement);
  });
});
