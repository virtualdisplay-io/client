import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EventBus } from '../../../src/events/event-bus';
import { EVENT_NAMES } from '../../../src/events/event-names';
import { MESSAGE_TYPES } from '../../../src/messaging/message-types';
import { Photo } from '../../../src/snapshot/photo';
import { SnapshotMessageHandler } from '../../../src/snapshot/snapshot-message-handler';

describe('SnapshotMessageHandler', () => {
  let eventBus = new EventBus();
  let handler = new SnapshotMessageHandler(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new SnapshotMessageHandler(eventBus);
  });

  describe('message handling', () => {
    it('should develop photo when matching message arrives', () => {
      const photo = new Photo('test.png');
      const callback = vi.fn();

      photo.onDeveloped(callback);
      handler.registerPhoto(photo);

      // Emit snapshot developed message
      eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
        message: {
          type: MESSAGE_TYPES.SNAPSHOT,
          filename: 'test.png',
          data: 'data:image/png;base64,abc123',
        },
      });

      expect(callback).toHaveBeenCalledWith({
        filename: 'test.png',
        data: 'data:image/png;base64,abc123',
      });
    });

    it('should ignore messages for unregistered photos', () => {
      const photo = new Photo('test.png');
      const callback = vi.fn();

      photo.onDeveloped(callback);
      // Not registering the photo

      eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
        message: {
          type: MESSAGE_TYPES.SNAPSHOT,
          filename: 'test.png',
          data: 'data:image/png;base64,abc123',
        },
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});

describe('SnapshotMessageHandler - multiple photos', () => {
  let eventBus = new EventBus();
  let handler = new SnapshotMessageHandler(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    handler = new SnapshotMessageHandler(eventBus);
  });

  it('should handle multiple photos with different filenames', () => {
    const photo1 = new Photo('photo1.png');
    const photo2 = new Photo('photo2.png');
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    photo1.onDeveloped(callback1);
    photo2.onDeveloped(callback2);

    handler.registerPhoto(photo1);
    handler.registerPhoto(photo2);

    // Develop photo2
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename: 'photo2.png',
        data: 'data:image/png;base64,photo2',
      },
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      filename: 'photo2.png',
      data: 'data:image/png;base64,photo2',
    });
  });

  it('should remove photo from pending after developing', () => {
    const photo = new Photo('test.png');
    const callback = vi.fn();

    photo.onDeveloped(callback);
    handler.registerPhoto(photo);

    // First message
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename: 'test.png',
        data: 'data:image/png;base64,first',
      },
    });

    // Second message (should be ignored)
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename: 'test.png',
        data: 'data:image/png;base64,second',
      },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      filename: 'test.png',
      data: 'data:image/png;base64,first',
    });
  });

  it('should ignore non-snapshot messages', () => {
    const photo = new Photo('test.png');
    const callback = vi.fn();

    photo.onDeveloped(callback);
    handler.registerPhoto(photo);

    // Emit non-snapshot message
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.STATE,
        nodes: [],
        isInitial: false,
      },
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
