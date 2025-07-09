import { vi } from 'vitest';

export interface LoadControlSetup {
  loadCallback: (() => void) | null;
  postMessageSpy: ReturnType<typeof vi.fn>;
  mockContentWindow: { postMessage: ReturnType<typeof vi.fn> };
}

export function setupIframeWithLoadControl(): LoadControlSetup {
  const mockContentWindow = {
    postMessage: vi.fn(),
  };

  let loadCallback: (() => void) | null = null;

  // Mock createElement to return our controlled iframe
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const originalCreateElement = document.createElement.bind(document);

  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'iframe') {
      // Create a real iframe element but with controlled properties
      const iframe = originalCreateElement('iframe') as HTMLIFrameElement;

      // Override contentWindow
      Object.defineProperty(iframe, 'contentWindow', {
        get: () => mockContentWindow,
        configurable: true,
      });

      // Capture load event listener
      const originalAddEventListener = iframe.addEventListener;
      iframe.addEventListener = vi.fn((event: string,
        callback: EventListenerOrEventListenerObject): void => {
        originalAddEventListener.call(iframe, event, callback);
        if (event === 'load' && typeof callback === 'function') {
          loadCallback = callback as () => void;
        }
      }) as HTMLIFrameElement['addEventListener'];

      return iframe;
    }
    // For other elements, use the original createElement
    return originalCreateElement(tagName);
  });

  return {
    loadCallback,
    postMessageSpy: mockContentWindow.postMessage,
    mockContentWindow,
  };
}
