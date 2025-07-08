/// <reference types="vite/client" />

import type { ClientOptions } from './client-options';
import { VirtualdisplayError } from './virtualdisplay-error';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { logger } from '../utils/logger';

/**
 * Builds and configures the iframe for Virtualdisplay
 */
export class IframeBuilder {
  private readonly defaultServer = 'https://server.virtualdisplay.io';

  private readonly options: ClientOptions;

  constructor(options: ClientOptions, private readonly eventBus: EventBus) {
    this.options = options;
  }

  /**
   * Create iframe element with Virtualdisplay viewer
   */
  public create(): HTMLIFrameElement {
    const iframe = this.createIframe();
    this.attachToParent(iframe);
    return iframe;
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.src = this.buildUrl();

    // Apply styles inline to avoid param reassign
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: 'none',
    });

    // Apply attributes
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'xr-spatial-tracking; fullscreen');

    iframe.addEventListener('load', () => {
      logger.info('Virtualdisplay iframe loaded');

      this.eventBus.emit(EVENT_NAMES.IFRAME_READY, {});
    });

    return iframe;
  }

  private attachToParent(iframe: HTMLIFrameElement): void {
    const parentElement = this.getParentElement();
    parentElement.appendChild(iframe);
  }

  private buildUrl(): string {
    const serverUrl = this.getServerUrl();
    const url = new URL(serverUrl);

    // Add required parameters
    url.searchParams.set('license', this.options.license);
    url.searchParams.set('model', this.options.model);

    // Add optional parameters
    if (this.options.debug === true) {
      url.searchParams.set('debug', 'true');
    }

    if (this.options.language !== undefined) {
      url.searchParams.set('language', this.options.language);
    }

    return url.toString();
  }

  /**
   * Get server URL from environment or use default
   */
  private getServerUrl(): string {
    // Check for environment variable (set during build)
    if (import.meta?.env?.VITE_VIRTUALDISPLAY_SERVER_HOST !== undefined) {
      return import.meta.env.VITE_VIRTUALDISPLAY_SERVER_HOST as string;
    }

    return this.defaultServer;
  }

  /**
   * Get parent element from selector or element
   */
  private getParentElement(): HTMLElement {
    if (typeof this.options.parent !== 'string') {
      return this.options.parent;
    }

    const element = document.querySelector(this.options.parent);
    if (element === null) {
      throw VirtualdisplayError.parentNotFound(this.options.parent);
    }

    return element as HTMLElement;
  }
}
