import { VirtualDisplayMessageEventData } from './types/virtual-display-message-event';

export class MessageQueue {
  private isReady: boolean = false;
  private queue: VirtualDisplayMessageEventData[] = [];

  constructor(
    private readonly targetWindow: Window,
    private readonly targetOrigin: string = '*'
  ) {}

  public send(message: VirtualDisplayMessageEventData): void {
    if (!this.isReady) {
      this.queue.push(message);
      return;
    }

    this.targetWindow.postMessage(message, this.targetOrigin);
  }

  public flush(): void {
    this.isReady = true;

    for (const msg of this.queue) {
      this.targetWindow.postMessage(msg, this.targetOrigin);
    }

    this.queue = [];
    this.queue.length = 0;
  }
}
