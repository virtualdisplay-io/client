import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestQueue } from '../../../src/message/queue';
import { VirtualDisplayRequest } from '../../../src/message/message';

describe('RequestQueue', (): void => {
  // @ts-ignore
  let postMessageSpy: vi.Mock;
  let targetWindow: Window;
  let queue: RequestQueue;

  beforeEach((): void => {
    postMessageSpy = vi.fn();
    targetWindow = { postMessage: postMessageSpy } as unknown as Window;

    queue = new RequestQueue(targetWindow, 'https://virtualdisplay.io');
  });

  it('should queue messages if not ready', (): void => {
    // @ts-ignore
    const msg: VirtualDisplayRequest = { type: 'test', context: 1 };
    queue.send(msg);

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('should flush queued messages in order', (): void => {
    const msgs: VirtualDisplayRequest[] = [
      // @ts-ignore
      { type: 'one', context: 1 },
      // @ts-ignore
      { type: 'two', context: 2 },
    ];
    queue.send(msgs[0]);
    queue.send(msgs[1]);
    queue.flush();

    expect(postMessageSpy).toHaveBeenNthCalledWith(
      1,
      msgs[0],
      'https://virtualdisplay.io'
    );
    expect(postMessageSpy).toHaveBeenNthCalledWith(
      2,
      msgs[1],
      'https://virtualdisplay.io'
    );
  });

  it('should clear the queue after flush', (): void => {
    const msg: VirtualDisplayRequest = {
      // @ts-ignore
      type: 'flush-clear',
      // @ts-ignore
      context: 42,
    };
    queue.send(msg);
    queue.flush();

    // flush again, should NOT resend!
    postMessageSpy.mockClear();
    queue.flush();

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('should send messages immediately if ready', (): void => {
    queue.flush();
    const msg: VirtualDisplayRequest = {
      // @ts-ignore
      type: 'immediate',
      // @ts-ignore
      context: 99,
    };
    queue.send(msg);

    expect(postMessageSpy).toHaveBeenCalledWith(
      msg,
      'https://virtualdisplay.io'
    );
  });

  it('should respect custom targetOrigin', (): void => {
    queue.flush();
    const msg: VirtualDisplayRequest = {
      // @ts-ignore
      type: 'origin-test',
      // @ts-ignore
      context: 'test',
    };
    queue.send(msg);

    expect(postMessageSpy).toHaveBeenCalledWith(
      msg,
      'https://virtualdisplay.io'
    );
  });

  it('should default targetOrigin to *', (): void => {
    queue = new RequestQueue(targetWindow);
    queue.flush();
    const msg: VirtualDisplayRequest = {
      // @ts-ignore
      type: 'star-origin',
      // @ts-ignore
      context: 0,
    };
    queue.send(msg);

    expect(postMessageSpy).toHaveBeenCalledWith(msg, '*');
  });
});
