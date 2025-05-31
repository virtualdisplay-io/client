import { VirtualDisplayMessageEvent } from './types/message';

type VirtualDisplayMessageHandler<T = unknown> = (data: T) => void;

class MessageBus {
  private handlers: Map<
    VirtualDisplayMessageEvent,
    VirtualDisplayMessageHandler<unknown>[]
  > = new Map();

  public subscribe<T>(
    type: VirtualDisplayMessageEvent,
    handler: VirtualDisplayMessageHandler<T>
  ): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    const existingHandlers = this.handlers.get(
      type
    )! as VirtualDisplayMessageHandler<T>[];
    existingHandlers.push(handler);
  }

  public publish<T>(type: VirtualDisplayMessageEvent, data: T): void {
    const subscribers: VirtualDisplayMessageHandler<unknown>[] =
      this.handlers.get(type) || [];

    for (const handler of subscribers) {
      handler(data);
    }
  }

  public once<T>(type: VirtualDisplayMessageEvent): Promise<T> {
    return new Promise((resolve): void => {
      const handler: VirtualDisplayMessageHandler<T> = (data: T): void => {
        resolve(data);
        this.unsubscribe(type, handler);
      };
      this.subscribe(type, handler);
    });
  }

  public unsubscribe<T>(
    type: VirtualDisplayMessageEvent,
    handler: VirtualDisplayMessageHandler<T>
  ): void {
    const handlers: VirtualDisplayMessageHandler<unknown>[] =
      this.handlers.get(type) || [];

    this.handlers.set(
      type,
      handlers.filter(
        (h: VirtualDisplayMessageHandler<unknown>) => h !== handler
      )
    );
  }
}

export const messageBus = new MessageBus();
