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
import { logger } from './utils/logger';

export class VirtualDisplayClient {
  private readonly iframeElement: HTMLIFrameElement;
  private readonly queue: RequestQueue;

  constructor(iframe: string | HTMLIFrameElement) {
    logger.debug('Initializing VirtualDisplayClient');
    const localIframe: HTMLIFrameElement =
      typeof iframe === 'string' ? verifiedIframeResolver(iframe) : iframe;

    this.iframeElement = iframeAttributeFactory(localIframe);
    logger.debug('Iframe element configured', { src: this.iframeElement.src });

    this.queue = new RequestQueue(this.iframeElement.contentWindow!);
    this.iframeElement.addEventListener('load', (): void => {
      logger.info('Iframe loaded, flushing message queue');
      this.queue.flush();
    });

    this.setupListener();
    logger.info('VirtualDisplayClient initialized successfully');
  }

  private setupListener(): void {
    window.addEventListener('message', (event: MessageEvent): void => {
      const message: VirtualDisplayResponse = event.data;
      if (message && message.type) {
        logger.debug('Received message from iframe', { type: message.type });
        responseDispatcher.publish(message);
      }
    });
  }

  public sendClientState(state: State): void {
    logger.debug('Sending client state', { attributeCount: state.attributes.length });
    const message: VirtualDisplayRequest = {
      type: VirtualDisplayRequestType.CLIENT_STATE,
      context: state,
    };

    this.queue.send(message);
  }

  public async requestObjectTree(
    origin: string | null = null
  ): Promise<VirtualDisplayResponse> {
    logger.debug('Requesting object tree', { origin });
    const type = VirtualDisplayRequestType.OBJECT_TREE;
    const message: VirtualDisplayRequest = {
      type,
      context: { origin },
    };

    this.queue.send(message);

    const response = await responseDispatcher.once(VirtualDisplayResponseType.OBJECT_TREE);
    logger.debug('Object tree response received');
    return response;
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
