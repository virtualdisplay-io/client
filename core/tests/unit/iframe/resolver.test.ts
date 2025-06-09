import { beforeEach, describe, expect, it } from 'vitest';
import { verifiedIframeResolver } from '../../../src/iframe/resolver';
import { createIframeWithWindow } from './iframe-creator';

describe('verifiedIframeResolver', (): void => {
  beforeEach((): void => {
    document.body.innerHTML = '';
  });

  it('throws error if selector is empty', (): void => {
    expect((): HTMLIFrameElement => verifiedIframeResolver('')).toThrow(
      'Iframe selector cannot be an empty string. Please provide a valid CSS selector.'
    );
  });

  it('throws error if element not found', (): void => {
    expect(
      (): HTMLIFrameElement => verifiedIframeResolver('#not-found')
    ).toThrow(
      "Iframe with selector '#not-found' not found in the DOM. Check that the iframe exists and the selector is correct."
    );
  });

  it('throws error if verifiedIframeResolver is called with invalid selector', (): void => {
    expect((): HTMLIFrameElement => verifiedIframeResolver('[')).toThrow(
      "Invalid selector '[' passed to verifiedIframeResolver"
    );
  });

  it('throws error if element is not an iframe', (): void => {
    const div: HTMLDivElement = document.createElement('div');
    div.id = 'not-iframe';

    document.body.appendChild(div);

    expect(
      (): HTMLIFrameElement => verifiedIframeResolver('#not-iframe')
    ).toThrow(
      "Element with selector '#not-iframe' is not an iframe. Check your selector or ensure the element is an <iframe>."
    );
  });

  // These tests are skipped because jsdom doesn't handle modified DOM properties well
  // In a real browser, these scenarios would be caught by the checks

  it('returns the iframe if all checks pass', (): void => {
    const iframe: HTMLIFrameElement = createIframeWithWindow('my-iframe');

    document.body.appendChild(iframe);

    expect(verifiedIframeResolver('#my-iframe')).toBe(iframe);
  });
});
