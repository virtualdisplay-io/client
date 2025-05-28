import { messageBus } from './message-bus';
import {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  MESSAGE_EVENT_MODEL_TREE_RESPONSE,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
} from './types/message-events';
import { State } from './types/state';
import { VirtualDisplayMessageEventData } from './types/virtual-display-message-event';

export class VirtualDisplayClient {
  constructor(private iframeSelector: string) {
    if (!this.iframeSelector || this.iframeSelector.trim() === '') {
      throw new Error('Iframe selector cannot be an empty string.');
    }

    this.setupListener();
  }

  private setupListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      const message: VirtualDisplayMessageEventData = event.data;
      if (message && message.type) {
        messageBus.publish(message.type, message.context);
      }
    });
  }

  public sendClientState(state: State): void {
    const message: VirtualDisplayMessageEventData<State> = {
      type: MESSAGE_EVENT_SEND_CLIENT_STATE,
      context: state,
    };
    this.postMessage(message);
  }

  public async requestModelTree(): Promise<VirtualDisplayMessageEventData> {
    const message: VirtualDisplayMessageEventData<null> = {
      type: MESSAGE_EVENT_MODEL_TREE_REQUEST,
      context: null,
    };

    this.postMessage(message);

    return messageBus.once(MESSAGE_EVENT_MODEL_TREE_RESPONSE);
  }

  private postMessage(message: VirtualDisplayMessageEventData): void {
    const element = document.querySelector(this.iframeSelector) as HTMLElement;

    if (!element) {
      throw new Error(
        `Iframe with selector '${this.iframeSelector}' not found.`
      );
    }

    if (!(element instanceof HTMLIFrameElement)) {
      throw new Error(
        `Element with selector '${this.iframeSelector}' is not an iframe.`
      );
    }

    const iframe = element as HTMLIFrameElement;

    if (!iframe.contentWindow) {
      throw new Error(
        `Iframe with selector '${this.iframeSelector}' does not have a contentWindow.`
      );
    }

    try {
      iframe.contentWindow.postMessage(message, '*');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'SecurityError') {
        throw new Error(
          `Failed to send message to iframe due to cross-origin restrictions.`
        );
      }
      throw new Error(
        `Failed to send message to iframe: ${(error as Error).message}`
      );
    }
  }
}
