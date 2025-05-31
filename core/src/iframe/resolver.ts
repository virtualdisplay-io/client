/**
 * Returns a validated HTMLIFrameElement for the given selector.
 * Throws actionable, unique errors for each validation step.
 */
export function verifiedIframeResolver(selector: string): HTMLIFrameElement {
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
      `Invalid selector '${selector}' passed to verifiedIframeResolver. Error: ${(err as Error).message}`
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
