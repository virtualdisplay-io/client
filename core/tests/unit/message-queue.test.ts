import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageQueue } from '../../src/message-queue';
import type { VirtualDisplayMessageEventData } from '../../src';

describe('MessageQueue', (): void => {
  // @ts-ignore
  let postMessageSpy: vi.Mock;
  let targetWindow: Window;
  let queue: MessageQueue;

  beforeEach((): void => {
    postMessageSpy = vi.fn();
    targetWindow = { postMessage: postMessageSpy } as unknown as Window;

    queue = new MessageQueue(targetWindow, 'https://virtualdisplay.io');
  });

  it('should queue messages if not ready', (): void => {
    const msg: VirtualDisplayMessageEventData = { type: 'test', context: 1 };
    queue.send(msg);

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('should flush queued messages in order', (): void => {
    const msgs: VirtualDisplayMessageEventData[] = [
      { type: 'one', context: 1 },
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
    const msg: VirtualDisplayMessageEventData = {
      type: 'flush-clear',
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
    const msg: VirtualDisplayMessageEventData = {
      type: 'immediate',
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
    const msg: VirtualDisplayMessageEventData = {
      type: 'origin-test',
      context: 'test',
    };
    queue.send(msg);

    expect(postMessageSpy).toHaveBeenCalledWith(
      msg,
      'https://virtualdisplay.io'
    );
  });

  it('should default targetOrigin to *', (): void => {
    queue = new MessageQueue(targetWindow);
    queue.flush();
    const msg: VirtualDisplayMessageEventData = {
      type: 'star-origin',
      context: 0,
    };
    queue.send(msg);

    expect(postMessageSpy).toHaveBeenCalledWith(msg, '*');
  });
});
