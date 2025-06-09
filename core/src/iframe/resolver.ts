import { logger } from '../utils/logger';

/**
 * Returns a validated HTMLIFrameElement for the given selector.
 * Throws actionable, unique errors for each validation step.
 */
export function verifiedIframeResolver(selector: string): HTMLIFrameElement {
  logger.debug('Resolving iframe by selector', { selector });

  if (!selector || selector.trim() === '') {
    const error = `Iframe selector cannot be an empty string. Please provide a valid CSS selector.`;
    logger.error('Empty iframe selector provided');
    throw new Error(error);
  }

  let element: Element | null;
  try {
    element = document.querySelector(selector);
  } catch (err) {
    const error = `Invalid selector '${selector}' passed to verifiedIframeResolver. Error: ${(err as Error).message}`;
    logger.error('Invalid CSS selector', {
      selector,
      error: (err as Error).message,
    });
    throw new Error(error);
  }

  if (!element) {
    const error = `Iframe with selector '${selector}' not found in the DOM. Check that the iframe exists and the selector is correct.`;
    logger.error('Iframe element not found', { selector });
    throw new Error(error);
  }

  if (!(element instanceof HTMLIFrameElement)) {
    const error = `Element with selector '${selector}' is not an iframe. Check your selector or ensure the element is an <iframe>.`;
    logger.error('Element is not an iframe', {
      selector,
      element,
      tagName: element.tagName,
    });
    throw new Error(error);
  }

  if (!('contentWindow' in element) || !element.contentWindow) {
    const error = `Iframe with selector '${selector}' does not have a contentWindow. This may happen if the iframe is not yet attached to the DOM or its src is not set.`;
    logger.error('Iframe missing contentWindow', { selector, element });
    throw new Error(error);
  }

  if (!('style' in element) || !element.style) {
    const error = `Iframe with selector '${selector}' does not have a style property. This usually indicates a broken DOM or non-standard iframe implementation.`;
    logger.error('Iframe missing style property', { selector, element });
    throw new Error(error);
  }

  logger.debug('Successfully resolved iframe', {
    selector,
    src: element.src,
    id: element.id,
  });

  return element;
}
