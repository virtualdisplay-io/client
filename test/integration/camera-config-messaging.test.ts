import {
  describe, it, expect, beforeEach, afterEach, vi,
} from 'vitest';

import { MESSAGE_TYPES, type ConfigMessage, VirtualdisplayClient } from '../../src';

// Test state
let client = null as VirtualdisplayClient | null;
let container = null as HTMLDivElement | null;
let postMessageSpy = null as ReturnType<typeof vi.fn> | null;

// Test helpers
const waitForInit = async (iframe: HTMLIFrameElement): Promise<void> => {
  // Client waits for iframe load before sending IFRAME_READY
  const loadEvent = new Event('load');
  iframe.dispatchEvent(loadEvent);

  // Give event handlers time to process
  await new Promise<void>(resolve => {
    setTimeout(resolve, 10);
  });
};

const createTestContainer = (): HTMLDivElement => {
  const div = document.createElement('div');
  div.id = 'test-viewer';
  document.body.appendChild(div);
  return div;
};

const mockIframeContentWindow = (): HTMLIFrameElement => {
  postMessageSpy = vi.fn();

  // Mock postMessage to capture CONFIG messages
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockReturnValue({
    postMessage: postMessageSpy,
  } as unknown as Window);

  const iframe = document.createElement('iframe');

  // Intercept iframe creation to return our mock
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'iframe') {
      return iframe;
    }
    return document.createElement(tagName);
  });

  return iframe;
};

const findConfigMessage = (): ConfigMessage | undefined => {
  if (postMessageSpy === null) { return undefined; }

  const configCall = postMessageSpy.mock.calls.find(
    call => call[0]?.type === MESSAGE_TYPES.CONFIG,
  );

  return configCall?.[0] as ConfigMessage | undefined;
};

// Setup and teardown for tests
let mockIframe = null as HTMLIFrameElement | null;

const setupTest = (): void => {
  container = createTestContainer();
  mockIframe = mockIframeContentWindow();
};

const teardownTest = (): void => {
  client?.destroy();
  container?.remove();
  vi.restoreAllMocks();
  client = null;
  container = null;
  postMessageSpy = null;
  mockIframe = null;
};

// Factory function for clients with camera config
const createClientWithCamera = (camera: object): VirtualdisplayClient => {
  // Fresh mock for each test to avoid state pollution
  mockIframe = mockIframeContentWindow();

  return new VirtualdisplayClient({
    parent: '#test-viewer',
    model: 'test-model',
    license: 'test',
    camera,
  });
};

describe('Camera Config - Initial', () => {
  beforeEach(setupTest);
  afterEach(teardownTest);

  it('should send camera config in CONFIG message', async () => {
    client = createClientWithCamera({
      initialZoom: 150,
      minZoom: 50,
      maxZoom: 300,
      initialRotate: 45,
      initialTilt: 30,
    });

    await waitForInit(mockIframe!);

    const configMessage = findConfigMessage();
    expect(configMessage).toBeDefined();
    expect(configMessage?.config.camera).toEqual({
      initialZoom: 150,
      minZoom: 50,
      maxZoom: 300,
      initialRotate: 45,
      initialTilt: 30,
    });
  });

  it('should send CONFIG with UI config', async () => {
    client = new VirtualdisplayClient({
      parent: '#test-viewer',
      model: 'test-model',
      license: 'test',
      ui: {
        arEnabled: false,
        fullscreenEnabled: true,
        loadingIndicatorEnabled: false,
      },
    });

    await waitForInit(mockIframe!);

    const configMessage = findConfigMessage();
    expect(configMessage).toBeDefined();
    expect(configMessage?.config.camera).toBeUndefined();
    expect(configMessage?.config.ui).toEqual({
      arEnabled: false,
      fullscreenEnabled: true,
      loadingIndicatorEnabled: false,
    });
  });

  it('should send both camera and UI config together', async () => {
    client = new VirtualdisplayClient({
      parent: '#test-viewer',
      model: 'test-model',
      license: 'test',
      camera: {
        initialZoom: 100,
        minZoom: 25,
        maxZoom: 400,
      },
      ui: {
        arEnabled: true,
        fullscreenEnabled: true,
        loadingIndicatorEnabled: false,
      },
    });

    await waitForInit(mockIframe!);

    const configMessage = findConfigMessage();
    expect(configMessage).toBeDefined();
    expect(configMessage?.config.camera).toEqual({
      initialZoom: 100,
      minZoom: 25,
      maxZoom: 400,
    });
    expect(configMessage?.config.ui).toEqual({
      arEnabled: true,
      fullscreenEnabled: true,
      loadingIndicatorEnabled: false,
    });
  });
});
