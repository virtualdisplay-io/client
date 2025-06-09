import { VirtualDisplayResponse, VirtualDisplayResponseType } from './message';

type Handler = (data: VirtualDisplayResponse) => void;

class ResponseDispatcher {
  private handlers: Map<VirtualDisplayResponseType, Handler[]> = new Map();

  public subscribe(type: VirtualDisplayResponseType, handler: Handler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    this.handlers.get(type)!.push(handler);
  }

  public unsubscribe(type: VirtualDisplayResponseType, handler: Handler): void {
    const list: Handler[] | undefined = this.handlers.get(type);
    if (!list) {
      return;
    }

    this.handlers.set(
      type,
      list.filter((h: Handler) => h !== handler)
    );
  }

  public publish(response: VirtualDisplayResponse): void {
    const list: Handler[] | undefined = this.handlers.get(response.type);
    if (!list) {
      return;
    }

    for (const handler of list) {
      handler(response);
    }
  }

  public once(
    type: VirtualDisplayResponseType,
    filter?: (response: VirtualDisplayResponse) => boolean
  ): Promise<VirtualDisplayResponse> {
    return new Promise((resolve): void => {
      const handler: Handler = (data: VirtualDisplayResponse): void => {
        if (!filter || filter(data)) {
          this.unsubscribe(type, handler);
          resolve(data);
        }
      };

      this.subscribe(type, handler);
    });
  }
}

export const responseDispatcher = new ResponseDispatcher();
