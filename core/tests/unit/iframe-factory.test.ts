import { describe, it, expect, beforeEach } from 'vitest';
import {
  getValidatedIframe,
  prepareVirtualDisplayIframe,
} from '../../src/iframe-factory';

function createIframeWithWindow(id?: string): HTMLIFrameElement {
  const iframe: HTMLIFrameElement = document.createElement('iframe');
  if (id) {
    iframe.id = id;
  }

  Object.defineProperty(iframe, 'contentWindow', {
    value: {},
    writable: true,
  });

  return iframe;
}

describe('getValidatedIframe', (): void => {
  beforeEach((): void => {
    document.body.innerHTML = '';
  });

  it('throws error if selector is empty', (): void => {
    expect((): HTMLIFrameElement => getValidatedIframe('')).toThrow(
      'Iframe selector cannot be an empty string. Please provide a valid CSS selector.'
    );
  });

  it('throws error if element not found', (): void => {
    expect((): HTMLIFrameElement => getValidatedIframe('#not-found')).toThrow(
      "Iframe with selector '#not-found' not found in the DOM. Check that the iframe exists and the selector is correct."
    );
  });

  it('throws error if getValidatedIframe is called with invalid selector', (): void => {
    expect((): HTMLIFrameElement => getValidatedIframe('[')).toThrow(
      "Invalid selector '[' passed to getValidatedIframe"
    );
  });

  it('throws error if element is not an iframe', (): void => {
    const div: HTMLDivElement = document.createElement('div');
    div.id = 'not-iframe';

    document.body.appendChild(div);

    expect((): HTMLIFrameElement => getValidatedIframe('#not-iframe')).toThrow(
      "Element with selector '#not-iframe' is not an iframe. Check your selector or ensure the element is an <iframe>."
    );
  });

  it('throws error if iframe.contentWindow is missing', (): void => {
    const iframe: HTMLIFrameElement = document.createElement('iframe');
    iframe.id = 'no-content-window';
    Object.defineProperty(iframe, 'contentWindow', { value: null });

    document.body.appendChild(iframe);

    expect(
      (): HTMLIFrameElement => getValidatedIframe('#no-content-window')
    ).toThrow(
      "Iframe with selector '#no-content-window' does not have a contentWindow. This may happen if the iframe is not yet attached to the DOM or its src is not set."
    );
  });

  it('throws error if iframe.style is missing', (): void => {
    const iframe: HTMLIFrameElement = createIframeWithWindow('no-style');
    Object.defineProperty(iframe, 'style', { value: undefined });

    document.body.appendChild(iframe);

    expect((): HTMLIFrameElement => getValidatedIframe('#no-style')).toThrow(
      "Iframe with selector '#no-style' does not have a style property. This usually indicates a broken DOM or non-standard iframe implementation."
    );
  });

  it('returns the iframe if all checks pass', (): void => {
    const iframe: HTMLIFrameElement = createIframeWithWindow('my-iframe');

    document.body.appendChild(iframe);

    expect(getValidatedIframe('#my-iframe')).toBe(iframe);
  });
});

describe('prepareVirtualDisplayIframe', (): void => {
  let iframe: HTMLIFrameElement;

  const features: string[] = [
    'fullscreen',
    'xr-spatial-tracking',
    'camera',
    'clipboard-write',
  ];

  beforeEach((): void => {
    iframe = createIframeWithWindow();
  });

  it('throws if prepareVirtualDisplayIframe is called on a non-iframe element', (): void => {
    const div = document.createElement('div');
    // @ts-expect-error
    expect((): HTMLIFrameElement => prepareVirtualDisplayIframe(div)).toThrow(
      'Provided element is not an iframe. Make sure to pass a valid HTMLIFrameElement to prepareVirtualDisplayIframe.'
    );
  });

  it('throws if iframe.style is missing', (): void => {
    Object.defineProperty(iframe, 'style', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(
      (): HTMLIFrameElement => prepareVirtualDisplayIframe(iframe)
    ).toThrow(
      'Cannot prepare iframe: style property is missing on the provided iframe element. This may indicate a non-standard or corrupted DOM node.'
    );
  });

  it('does not add duplicate allowfullscreen attribute', (): void => {
    iframe.setAttribute('allowfullscreen', '');
    prepareVirtualDisplayIframe(iframe);
    expect(iframe.getAttribute('allowfullscreen')).toBe('');
  });

  it('prepareVirtualDisplayIframe returns the same iframe instance', (): void => {
    const result: HTMLIFrameElement = prepareVirtualDisplayIframe(iframe);
    expect(result).toBe(iframe);
  });

  it('adds allowfullscreen, and default styles if missing', (): void => {
    prepareVirtualDisplayIframe(iframe);
    expect(iframe.hasAttribute('allowfullscreen')).toBe(true);

    expect(iframe.style.display).toBe('block');
    expect(iframe.style.width).toBe('100%');
    expect(iframe.style.height).toBe('100%');
    expect(['', 'none']).toContain(iframe.style.border);
    expect(iframe.style.minHeight).toBe('0');
    expect(iframe.style.minWidth).toBe('0');
  });

  it('does not overwrite existing style', (): void => {
    iframe.setAttribute('style', 'background:red;');
    prepareVirtualDisplayIframe(iframe);

    expect(iframe.style.background).toBe('red');
    expect(iframe.style.display).toBe('block');
    expect(iframe.style.width).toBe('100%');
    expect(iframe.style.height).toBe('100%');
    expect(['', 'none']).toContain(iframe.style.border);
    expect(iframe.style.minHeight).toBe('0');
    expect(iframe.style.minWidth).toBe('0');
  });

  it('does not overwrite default style if defined differently', (): void => {
    iframe.style.display = 'inline-block';
    iframe.style.width = '50vw';
    iframe.style.height = '50vh';
    iframe.style.border = '1px solid black';
    iframe.style.minHeight = '100px';
    iframe.style.minWidth = '100px';

    prepareVirtualDisplayIframe(iframe);

    expect(iframe.style.display).toBe('inline-block');
    expect(iframe.style.width).toBe('50vw');
    expect(iframe.style.height).toBe('50vh');
    expect(iframe.style.border).toBe('1px solid black');
    expect(iframe.style.minHeight).toBe('100px');
    expect(iframe.style.minWidth).toBe('100px');
  });

  it('does not overwrite existing inline styles set via setAttribute', (): void => {
    iframe.setAttribute('style', 'width: 42vw;');
    prepareVirtualDisplayIframe(iframe);
    expect(iframe.style.width).toBe('42vw');
  });

  it('adds required features to allow without duplicates', (): void => {
    iframe.setAttribute('allow', 'fullscreen');
    prepareVirtualDisplayIframe(iframe);

    const allow: string | null = iframe.getAttribute('allow');

    for (const feature of features) {
      expect(allow).toContain(feature);
      expect(
        allow!.split(';').filter((x: string) => x.trim() === feature).length
      ).toBe(1);
    }
  });

  it('preserves unknown features in allow attribute', (): void => {
    iframe.setAttribute('allow', 'banana;fullscreen');
    prepareVirtualDisplayIframe(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    expect(allow).toContain('banana');
    expect(allow).toContain('fullscreen');
  });

  it('merges custom and default allow features', (): void => {
    iframe.setAttribute('allow', 'fullscreen;microphone');
    prepareVirtualDisplayIframe(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    for (const feature of features) {
      expect(allow).toContain(feature);
    }
    expect(allow).toContain('microphone');
    expect(
      allow!.split(';').filter((x: string) => x.trim() === 'microphone').length
    ).toBe(1);
  });

  it('removes empty allow features when merging', (): void => {
    iframe.setAttribute('allow', 'fullscreen;;camera;;');
    prepareVirtualDisplayIframe(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    expect(allow!.split(';').filter((f: string) => !f)).toHaveLength(0);
  });

  it('merges multiple custom allow features and removes duplicates', (): void => {
    iframe.setAttribute('allow', 'fullscreen;fullscreen;microphone;camera;;');
    prepareVirtualDisplayIframe(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    const features: string[] = allow!
      .split(';')
      .map((f: string) => f.trim())
      .filter(Boolean);

    const unique: Set<string> = new Set(features);
    expect(features.length).toBe(unique.size);
  });
});
