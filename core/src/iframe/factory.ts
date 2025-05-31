/**
 * Prepares the given HTMLIFrameElement for use as a Virtual Display iframe.
 */
export function iframeAttributeFactory(
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

  return iframe;
}
