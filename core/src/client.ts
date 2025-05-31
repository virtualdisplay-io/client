import { messageBus } from './message-bus';
import {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  MESSAGE_EVENT_MODEL_TREE_RESPONSE,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
} from './types/events';
import { State } from './types/state';
import { VirtualDisplayMessageEventData } from './types/message';
import {
  getValidatedIframe,
  prepareVirtualDisplayIframe,
} from './iframe-factory';
import { MessageQueue } from './message-queue';

export class VirtualDisplayClient {
  private readonly iframeElement: HTMLIFrameElement;
  private readonly queue: MessageQueue;

  constructor(iframeSelector: string) {
    this.iframeElement = prepareVirtualDisplayIframe(
      getValidatedIframe(iframeSelector)
    );

    this.queue = new MessageQueue(this.iframeElement.contentWindow!);
    this.iframeElement.addEventListener('load', (): void => this.queue.flush());

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

    this.queue.send(message);
  }

  public async requestModelTree(): Promise<VirtualDisplayMessageEventData> {
    const message: VirtualDisplayMessageEventData<null> = {
      type: MESSAGE_EVENT_MODEL_TREE_REQUEST,
      context: null,
    };

    this.queue.send(message);

    return messageBus.once(MESSAGE_EVENT_MODEL_TREE_RESPONSE);
  }

  public get iframe(): HTMLIFrameElement {
    return this.iframeElement;
  }
}
