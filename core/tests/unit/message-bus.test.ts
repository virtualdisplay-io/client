import { describe, it, expect, vi } from 'vitest';
import { messageBus } from '../../src';
import {
  MESSAGE_EVENT_SEND_CLIENT_STATE,
  MESSAGE_EVENT_SEND_MODEL_TREE,
  MESSAGE_EVENT_SET_MODEL_STATE,
} from '../../src';

describe('MessageBus', () => {
  it('should subscribe and publish messages', () => {
    const handler = vi.fn();
    messageBus.subscribe(MESSAGE_EVENT_SEND_CLIENT_STATE, handler);
    messageBus.publish(MESSAGE_EVENT_SEND_CLIENT_STATE, { data: 'test' });

    expect(handler).toHaveBeenCalledWith({ data: 'test' });
  });

  it('should support one-time message handling with "once"', async () => {
    const handler = vi.fn();
    messageBus.once(MESSAGE_EVENT_SEND_MODEL_TREE).then(handler);
    messageBus.publish(MESSAGE_EVENT_SEND_MODEL_TREE, { once: true });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(handler).toHaveBeenCalledWith({ once: true });
  });

  it('should not call handler after once subscription is fulfilled', async () => {
    const handler = vi.fn();
    messageBus.once(MESSAGE_EVENT_SET_MODEL_STATE).then(handler);
    messageBus.publish(MESSAGE_EVENT_SET_MODEL_STATE, { once: true });

    await new Promise((resolve) => setTimeout(resolve, 10));
    messageBus.publish(MESSAGE_EVENT_SET_MODEL_STATE, { once: false });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
