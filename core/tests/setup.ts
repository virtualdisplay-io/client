// Workaround for jsdom HTMLIFrameElement instanceof issues
// jsdom doesn't properly implement HTMLIFrameElement, causing instanceof checks to fail

// Store original createElement
const originalCreateElement = document.createElement;

// Override createElement to ensure iframes pass instanceof checks
document.createElement = function (tagName: string): HTMLElement {
  const element = originalCreateElement.call(this, tagName);

  // For iframes, ensure they have the expected properties
  if (tagName.toLowerCase() === 'iframe') {
    // Ensure the element has contentWindow and style properties
    if (!element.hasOwnProperty('contentWindow')) {
      Object.defineProperty(element, 'contentWindow', {
        get() {
          // Return a mock window object if not set
          return this._contentWindow || { postMessage: (): void => {} };
        },
        set(value) {
          this._contentWindow = value;
        },
        configurable: true,
      });
    }

    // Make sure the iframe is recognized as HTMLIFrameElement
    // This is a jsdom workaround - in real browsers this wouldn't be needed
    Object.setPrototypeOf(element, HTMLIFrameElement.prototype);
  }

  return element;
};
