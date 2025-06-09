import { responseDispatcher } from './message/dispatcher';
import { State } from './types/state';
import {
  VirtualDisplayRequest,
  VirtualDisplayRequestType,
  VirtualDisplayResponse,
  VirtualDisplayResponseType,
} from './message/message';
import { iframeAttributeFactory } from './iframe/factory';
import { verifiedIframeResolver } from './iframe/resolver';
import { RequestQueue } from './message/queue';
import { VirtualDisplayClientOptions } from './iframe/options';
import { createVirtualDisplayClientWithIframe } from './iframe/builder';

export class VirtualDisplayClient {
  private readonly iframeElement: HTMLIFrameElement;
  private readonly queue: RequestQueue;

  constructor(iframe: string | HTMLIFrameElement) {
    const localIframe: HTMLIFrameElement =
      typeof iframe === 'string' ? verifiedIframeResolver(iframe) : iframe;

    this.iframeElement = iframeAttributeFactory(localIframe);

    this.queue = new RequestQueue(this.iframeElement.contentWindow);

    this.iframeElement.addEventListener('load', (): void => {
      // Update the queue's target window on load
      this.queue.updateTargetWindow(this.iframeElement.contentWindow);
      this.queue.flush();
    });

    this.setupListener();
  }

  private setupListener(): void {
    window.addEventListener('message', (event: MessageEvent): void => {
      const message: VirtualDisplayResponse = event.data;
      if (message && message.type) {
        responseDispatcher.publish(message);
      }
    });
  }

  public sendClientState(state: State): void {
    const message: VirtualDisplayRequest = {
      type: VirtualDisplayRequestType.CLIENT_STATE,
      context: state,
    };

    this.queue.send(message);
  }

  public async requestObjectTree(
    origin: string | null = null
  ): Promise<VirtualDisplayResponse> {
    const type = VirtualDisplayRequestType.OBJECT_TREE;
    const message: VirtualDisplayRequest = {
      type,
      context: { origin },
    };

    this.queue.send(message);

    return responseDispatcher.once(VirtualDisplayResponseType.OBJECT_TREE);
  }

  public onResponseSubscriber(
    type: VirtualDisplayResponseType,
    handler: (data: VirtualDisplayResponse) => void
  ): void {
    responseDispatcher.subscribe(type, handler);
  }

  public get iframe(): HTMLIFrameElement {
    return this.iframeElement;
  }

  static builder(options: VirtualDisplayClientOptions): VirtualDisplayClient {
    return createVirtualDisplayClientWithIframe(options);
  }
}
