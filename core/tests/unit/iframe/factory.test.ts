import { describe, it, expect, beforeEach } from 'vitest';
import { iframeAttributeFactory } from '../../../src/iframe/factory';
import { createIframeWithWindow } from './iframe-creator';

describe('iframeAttributeFactory', (): void => {
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

  it('throws if iframeAttributeFactory is called on a non-iframe element', (): void => {
    const div = document.createElement('div');
    // @ts-expect-error
    expect((): HTMLIFrameElement => iframeAttributeFactory(div)).toThrow(
      'Provided element is not an iframe. Make sure to pass a valid HTMLIFrameElement to prepareVirtualDisplayIframe.'
    );
  });

  it('throws if iframe.style is missing', (): void => {
    Object.defineProperty(iframe, 'style', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect((): HTMLIFrameElement => iframeAttributeFactory(iframe)).toThrow(
      'Cannot prepare iframe: style property is missing on the provided iframe element. This may indicate a non-standard or corrupted DOM node.'
    );
  });

  it('does not add duplicate allowfullscreen attribute', (): void => {
    iframe.setAttribute('allowfullscreen', '');
    iframeAttributeFactory(iframe);
    expect(iframe.getAttribute('allowfullscreen')).toBe('');
  });

  it('iframeAttributeFactory returns the same iframe instance', (): void => {
    const result: HTMLIFrameElement = iframeAttributeFactory(iframe);
    expect(result).toBe(iframe);
  });

  it('adds allowfullscreen, and default styles if missing', (): void => {
    iframeAttributeFactory(iframe);
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
    iframeAttributeFactory(iframe);

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

    iframeAttributeFactory(iframe);

    expect(iframe.style.display).toBe('inline-block');
    expect(iframe.style.width).toBe('50vw');
    expect(iframe.style.height).toBe('50vh');
    expect(iframe.style.border).toBe('1px solid black');
    expect(iframe.style.minHeight).toBe('100px');
    expect(iframe.style.minWidth).toBe('100px');
  });

  it('does not overwrite existing inline styles set via setAttribute', (): void => {
    iframe.setAttribute('style', 'width: 42vw;');
    iframeAttributeFactory(iframe);
    expect(iframe.style.width).toBe('42vw');
  });

  it('adds required features to allow without duplicates', (): void => {
    iframe.setAttribute('allow', 'fullscreen');
    iframeAttributeFactory(iframe);

    const allow: string | null = iframe.getAttribute('allow');

    for (const feature of features) {
      expect(allow).toContain(feature);
      expect(
        allow!.split(' ').filter((x: string) => x.trim() === feature).length
      ).toBe(1);
    }
  });

  it('preserves unknown features in allow attribute', (): void => {
    iframe.setAttribute('allow', 'banana;fullscreen');
    iframeAttributeFactory(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    expect(allow).toContain('banana');
    expect(allow).toContain('fullscreen');
  });

  it('merges custom and default allow features', (): void => {
    iframe.setAttribute('allow', 'fullscreen;microphone');
    iframeAttributeFactory(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    for (const feature of features) {
      expect(allow).toContain(feature);
    }
    expect(allow).toContain('microphone');
    expect(
      allow!.split(' ').filter((x: string) => x.trim() === 'microphone').length
    ).toBe(1);
  });

  it('removes empty allow features when merging', (): void => {
    iframe.setAttribute('allow', 'fullscreen;;camera;;');
    iframeAttributeFactory(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    expect(allow!.split(';').filter((f: string) => !f)).toHaveLength(0);
  });

  it('merges multiple custom allow features and removes duplicates', (): void => {
    iframe.setAttribute('allow', 'fullscreen;fullscreen;microphone;camera;;');
    iframeAttributeFactory(iframe);

    const allow: string | null = iframe.getAttribute('allow');
    const features: string[] = allow!
      .split(';')
      .map((f: string) => f.trim())
      .filter(Boolean);

    const unique: Set<string> = new Set(features);
    expect(features.length).toBe(unique.size);
  });
});
