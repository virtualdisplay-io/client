import { VirtualDisplayClientOptions } from './options';
import { VirtualDisplayClient } from '../client';
import { VirtualDisplayResponseType } from '../message/message';

export function createVirtualDisplayClientWithIframe(
  options: VirtualDisplayClientOptions
): VirtualDisplayClient {
  const iframe: HTMLIFrameElement = document.createElement('iframe');
  iframe.src = source(options.license, options.model, options.debug ?? false);
  iframe.id = options.iframeId ?? 'virtual-display-iframe';

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

  if (options.title) {
    iframe.title = options.title;
  }

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

  if (!(parent instanceof HTMLElement))
    throw new Error(
      `Parent must be a selector string or an HTMLElement, received: ${typeof parent}`
    );

  if (typeof parent.appendChild !== 'function')
    throw new Error(
      `Provided parent is an HTMLElement but cannot append children.`
    );

  return parent;
};

const validateParent = (el: Element | null, selector: string): HTMLElement => {
  if (!el) {
    throw new Error(
      `Parent element with selector "${selector}" not found in the DOM.`
    );
  }

  if (!(el instanceof HTMLElement)) {
    throw new Error(
      `Parent element with selector "${selector}" is not an HTMLElement.`
    );
  }

  if (typeof el.appendChild !== 'function') {
    throw new Error(`Parent element "${selector}" cannot append children.`);
  }

  return el;
};

const validateCssObject = (style: Partial<CSSStyleDeclaration>): void => {
  if (typeof style !== 'object' || Array.isArray(style)) {
    throw new Error(
      'The "style" option must be a plain object, for example:\n' +
        '    style: { background: "#f9fafb", border: "1px solid red" }\n' +
        'You probably passed a string or array instead. Only plain objects are allowed.'
    );
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
    'https://server.virtual-display.io';

  return `${hostName}?=${license}&model=${model}${debug ? '&debug=true' : ''}`;
};
