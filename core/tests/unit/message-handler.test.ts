import { describe, it, expect, vi } from 'vitest';
import { messageBus } from '../../src';
import { MESSAGE_EVENT_SEND_CLIENT_STATE } from '../../src';

describe('Message Handling', () => {
  it('should trigger callback when message is published', () => {
    const callback = vi.fn();
    messageBus.subscribe('virtualDisplay.getModelTree', callback);

    messageBus.publish('virtualDisplay.getModelTree', { success: true });
    expect(callback).toHaveBeenCalledWith({ success: true });
  });

  it('should not trigger callback after unsubscribing', () => {
    const callback = vi.fn();
    messageBus.subscribe(MESSAGE_EVENT_SEND_CLIENT_STATE, callback);
    messageBus.publish(MESSAGE_EVENT_SEND_CLIENT_STATE, { update: 1 });
    expect(callback).toHaveBeenCalledTimes(1);

    messageBus.unsubscribe(MESSAGE_EVENT_SEND_CLIENT_STATE, callback);
    messageBus.publish(MESSAGE_EVENT_SEND_CLIENT_STATE, { update: 2 });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
