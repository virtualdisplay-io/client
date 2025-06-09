import { logger } from '../utils/logger';

/**
 * Prepares the given HTMLIFrameElement for use as a Virtual Display iframe.
 */
export function iframeAttributeFactory(
  iframe: HTMLIFrameElement
): HTMLIFrameElement {
  logger.debug('Preparing iframe for Virtual Display', { iframe });

  if (!(iframe instanceof HTMLIFrameElement)) {
    const error = `Provided element is not an iframe. Make sure to pass a valid HTMLIFrameElement to prepareVirtualDisplayIframe.`;
    logger.error('Invalid iframe element', { iframe, type: typeof iframe });
    throw new Error(error);
  }

  if (!('style' in iframe) || !iframe.style) {
    const error = `Cannot prepare iframe: style property is missing on the provided iframe element. This may indicate a non-standard or corrupted DOM node.`;
    logger.error('Iframe missing style property', { iframe });
    throw new Error(error);
  }

  iframe.setAttribute('allowfullscreen', '');

  const defaultStyles: Partial<CSSStyleDeclaration> = {
    display: 'block',
    width: '100%',
    height: '100%',
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

  logger.debug('Successfully prepared iframe', {
    allowFeatures: Array.from(updatedFeatures),
    appliedStyles: Object.keys(defaultStyles),
  });

  return iframe;
}
