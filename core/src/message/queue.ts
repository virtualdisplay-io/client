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

    try {
      this.targetWindow.postMessage(request, this.targetOrigin);
    } catch (error) {
      // Silently handle postMessage errors (e.g., cross-origin, null window)
      // The message is lost but the client remains functional
    }
  }

  public flush(): void {
    this.isReady = true;

    for (const msg of this.queue) {
      try {
        this.targetWindow.postMessage(msg, this.targetOrigin);
      } catch (error) {
        // Silently handle postMessage errors during flush
      }
    }

    this.queue = [];
    this.queue.length = 0;
  }

  public updateTargetWindow(window: Window | null): void {
    this.targetWindow = window;
  }
}
