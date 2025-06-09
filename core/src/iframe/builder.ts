import { VirtualDisplayClientOptions } from './options';
import { VirtualDisplayClient } from '../client';
import { VirtualDisplayResponseType } from '../message/message';
import { logger } from '../utils/logger';

export function createVirtualDisplayClientWithIframe(
  options: VirtualDisplayClientOptions
): VirtualDisplayClient {
  logger.debug('Creating Virtual Display iframe client', { options });

  const iframe: HTMLIFrameElement = document.createElement('iframe');
  iframe.src = source(options.license, options.model, options.debug ?? false);
  iframe.id = options.iframeId ?? 'virtual-display-iframe';

  logger.debug('Created iframe element', { src: iframe.src, id: iframe.id });

  // added css styles
  if (options.style) {
    validateCssObject(options.style);

    for (const [prop, value] of Object.entries(options.style)) {
      // @ts-expect-error - Property is string-indexed
      iframe.style[prop as never] = value ?? '';
    }
  }

  if (options.classNames) {
    iframe.className = options.classNames;
  }

  // Always set a title for accessibility (WCAG 2.4.1)
  iframe.title = options.title || 'Virtual Display 3D Model Viewer';

  const parentEl: HTMLElement = parent(options.parent);
  parentEl.appendChild(iframe);

  const client = new VirtualDisplayClient(iframe);
  if (options.onResponse) {
    for (const type of Object.values(VirtualDisplayResponseType)) {
      client.onResponseSubscriber(
        type as VirtualDisplayResponseType,
        options.onResponse!
      );
    }
  }

  if (options.onReady) {
    iframe.addEventListener('load', (): void => options.onReady!(client));
  }

  return client;
}

const parent = (parent: string | HTMLElement): HTMLElement => {
  if (typeof parent === 'string') {
    return validateParent(document.querySelector(parent), parent);
  }

  if (!(parent instanceof HTMLElement)) {
    const error = `Parent must be a selector string or an HTMLElement, received: ${typeof parent}`;
    logger.error('Invalid parent element type', {
      parent,
      type: typeof parent,
    });
    throw new Error(error);
  }

  if (typeof parent.appendChild !== 'function') {
    const error = `Provided parent is an HTMLElement but cannot append children.`;
    logger.error('Parent element cannot append children', { parent });
    throw new Error(error);
  }

  return parent;
};

const validateParent = (el: Element | null, selector: string): HTMLElement => {
  if (!el) {
    const error = `Parent element with selector "${selector}" not found in the DOM.`;
    logger.error('Parent element not found', { selector });
    throw new Error(error);
  }

  if (!(el instanceof HTMLElement)) {
    const error = `Parent element with selector "${selector}" is not an HTMLElement.`;
    logger.error('Parent element is not HTMLElement', {
      selector,
      element: el,
    });
    throw new Error(error);
  }

  if (typeof el.appendChild !== 'function') {
    const error = `Parent element "${selector}" cannot append children.`;
    logger.error('Parent element cannot append children', {
      selector,
      element: el,
    });
    throw new Error(error);
  }

  return el;
};

const validateCssObject = (style: Partial<CSSStyleDeclaration>): void => {
  if (typeof style !== 'object' || Array.isArray(style)) {
    const error =
      'The "style" option must be a plain object, for example:\n' +
      '    style: { background: "#f9fafb", border: "1px solid red" }\n' +
      'You probably passed a string or array instead. Only plain objects are allowed.';
    logger.error('Invalid CSS style object', { style, type: typeof style });
    throw new Error(error);
  }
};

const source = (
  license: string,
  model: string,
  debug: boolean = false
): string => {
  const hostName: string =
    // @ts-ignore
    import.meta.env.VITE_VIRTUAL_DISPLAY_SERVER_HOST ??
    'https://server.virtualdisplay.io';

  return `${hostName}?license=${license}&model=${model}${debug ? '&debug=true' : ''}`;
};
