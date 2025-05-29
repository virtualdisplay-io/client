import { messageBus } from './message-bus';
import {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  MESSAGE_EVENT_MODEL_TREE_RESPONSE,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
} from './types/message-events';
import { State } from './types/state';
import { VirtualDisplayMessageEventData } from './types/virtual-display-message-event';
import {
  getValidatedIframe,
  prepareVirtualDisplayIframe,
} from './iframe-factory';

export class VirtualDisplayClient {
  private iframe: HTMLIFrameElement;

  constructor(iframeSelector: string) {
    this.iframe = prepareVirtualDisplayIframe(
      getValidatedIframe(iframeSelector)
    );

    this.setupListener();
  }

  private setupListener(): void {
    window.addEventListener('message', (event: MessageEvent): void => {
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
    try {
      this.iframe.contentWindow!.postMessage(message, '*');
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
