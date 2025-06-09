import { VirtualDisplayRequest } from './message';
import { logger } from '../utils/logger';

export class RequestQueue {
  private isReady: boolean = false;
  private queue: VirtualDisplayRequest[] = [];

  constructor(
    private readonly targetWindow: Window,
    private readonly targetOrigin: string = '*'
  ) {}

  public send(request: VirtualDisplayRequest): void {
    if (!this.isReady) {
      this.queue.push(request);
      return;
    }

    try {
      this.targetWindow.postMessage(request, this.targetOrigin);
    } catch (error) {
      logger.error('Failed to send message', { error, request });
    }
  }

  public flush(): void {
    this.isReady = true;

    for (const msg of this.queue) {
      try {
        this.targetWindow.postMessage(msg, this.targetOrigin);
      } catch (error) {
        logger.error('Failed to send queued message', { error, message: msg });
      }
    }

    this.queue = [];
    this.queue.length = 0;
  }
}
