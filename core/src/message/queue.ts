import { VirtualDisplayRequest } from './message';

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

    this.targetWindow.postMessage(request, this.targetOrigin);
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
