import { VirtualDisplayResponse, VirtualDisplayResponseType } from './message';
import { logger } from '../utils/logger';

type Handler = (data: VirtualDisplayResponse) => void;

class ResponseDispatcher {
  private handlers: Map<VirtualDisplayResponseType, Handler[]> = new Map();

  public subscribe(type: VirtualDisplayResponseType, handler: Handler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    this.handlers.get(type)!.push(handler);
    logger.debug('Handler subscribed', { type, handlerCount: this.handlers.get(type)!.length });
  }

  public unsubscribe(type: VirtualDisplayResponseType, handler: Handler): void {
    const list: Handler[] | undefined = this.handlers.get(type);
    if (!list) {
      logger.debug('No handlers to unsubscribe', { type });
      return;
    }

    const newList = list.filter((h: Handler) => h !== handler);
    this.handlers.set(type, newList);
    logger.debug('Handler unsubscribed', { type, handlerCount: newList.length });
  }

  public publish(response: VirtualDisplayResponse): void {
    const list: Handler[] | undefined = this.handlers.get(response.type);
    if (!list) {
      logger.debug('No handlers for response type', { type: response.type });
      return;
    }

    logger.debug('Publishing response to handlers', { type: response.type, handlerCount: list.length });
    for (const handler of list) {
      handler(response);
    }
  }

  public once(
    type: VirtualDisplayResponseType
  ): Promise<VirtualDisplayResponse> {
    return new Promise((resolve): void => {
      const handler: Handler = (data: VirtualDisplayResponse): void => {
        this.unsubscribe(type, handler);
        resolve(data);
      };

      this.subscribe(type, handler);
    });
  }
}

export const responseDispatcher = new ResponseDispatcher();
