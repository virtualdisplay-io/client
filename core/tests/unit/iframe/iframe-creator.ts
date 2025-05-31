export function createIframeWithWindow(id?: string): HTMLIFrameElement {
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
