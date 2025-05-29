/**
 * Returns a validated HTMLIFrameElement for the given selector.
 * Throws actionable, unique errors for each validation step.
 */
export function getValidatedIframe(selector: string): HTMLIFrameElement {
  if (!selector || selector.trim() === '') {
    throw new Error(
      `Iframe selector cannot be an empty string. Please provide a valid CSS selector.`
    );
  }

  let element: Element | null;
  try {
    element = document.querySelector(selector);
  } catch (err) {
    throw new Error(
      `Invalid selector '${selector}' passed to getValidatedIframe. Error: ${(err as Error).message}`
    );
  }

  if (!element) {
    throw new Error(
      `Iframe with selector '${selector}' not found in the DOM. Check that the iframe exists and the selector is correct.`
    );
  }

  if (!(element instanceof HTMLIFrameElement)) {
    throw new Error(
      `Element with selector '${selector}' is not an iframe. Check your selector or ensure the element is an <iframe>.`
    );
  }

  if (!('contentWindow' in element) || !element.contentWindow) {
    throw new Error(
      `Iframe with selector '${selector}' does not have a contentWindow. This may happen if the iframe is not yet attached to the DOM or its src is not set.`
    );
  }

  if (!('style' in element) || !element.style) {
    throw new Error(
      `Iframe with selector '${selector}' does not have a style property. This usually indicates a broken DOM or non-standard iframe implementation.`
    );
  }

  return element;
}

/**
 * Prepares the given HTMLIFrameElement for use as a virtual display.
 * Throws explicit errors on invalid input or missing DOM properties.
 */
export function prepareVirtualDisplayIframe(
  iframe: HTMLIFrameElement
): HTMLIFrameElement {
  if (!(iframe instanceof HTMLIFrameElement)) {
    throw new Error(
      `Provided element is not an iframe. Make sure to pass a valid HTMLIFrameElement to prepareVirtualDisplayIframe.`
    );
  }

  if (!('style' in iframe) || !iframe.style) {
    throw new Error(
      `Cannot prepare iframe: style property is missing on the provided iframe element. This may indicate a non-standard or corrupted DOM node.`
    );
  }

  iframe.setAttribute('allowfullscreen', '');

  const defaultStyles: Partial<CSSStyleDeclaration> = {
    display: 'block',
    width: '100vw',
    height: '100vh',
    border: 'none',
    minHeight: '0',
    minWidth: '0',
  };

  for (const [property, value] of Object.entries(defaultStyles)) {
    const prop = property as keyof CSSStyleDeclaration;
    if (!iframe.style[prop]) {
      // @ts-ignore
      iframe.style[prop] = value!;
    }
  }

  const requiredFeatures: string[] = [
    'fullscreen',
    'xr-spatial-tracking',
    'camera',
    'clipboard-write',
  ];

  const currentFeatures = (iframe.getAttribute('allow') || '')
    .split(';')
    .map((feature: string) => feature.trim())
    .filter(Boolean);

  const updatedFeatures = new Set([...currentFeatures, ...requiredFeatures]);
  iframe.setAttribute('allow', Array.from(updatedFeatures).join(';'));

  return iframe;
}
