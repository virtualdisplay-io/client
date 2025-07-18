import { describe, it, expect, vi, beforeEach } from 'vitest';

import { VirtualdisplayError, ERROR_CODES } from '../../../src/client/virtualdisplay-error';
import { EventBus } from '../../../src/events/event-bus';
import { EVENT_NAMES } from '../../../src/events/event-names';
import { MESSAGE_TYPES } from '../../../src/messaging/message-types';
import { Photo } from '../../../src/snapshot/photo';
import { Snapshot } from '../../../src/snapshot/snapshot';

describe('Snapshot - basic tests', () => {
  let eventBus = new EventBus();
  let snapshotApi = new Snapshot(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    snapshotApi = new Snapshot(eventBus);
  });

  describe('take', () => {
    it('should create a Photo and emit snapshot message', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');

      const photo = snapshotApi.take('product.png');

      expect(photo).toBeInstanceOf(Photo);
      expect(photo.getFilename()).toBe('product.png');

      expect(emitSpy).toHaveBeenCalledWith(EVENT_NAMES.SNAPSHOT_MESSAGE, {
        message: {
          type: MESSAGE_TYPES.SNAPSHOT,
          filename: 'product.png',
        },
      });
    });

    it('should accept valid image extensions', () => {
      const validFilenames = [
        'image.png',
        'photo.jpg',
        'picture.jpeg',
        'modern.webp',
        'UPPERCASE.PNG',
        'MiXeD.JpG',
      ];

      validFilenames.forEach(filename => {
        expect(() => snapshotApi.take(filename)).not.toThrow();
      });
    });

    it('should throw error for invalid filename', () => {
      expect(() => snapshotApi.take('')).toThrow(VirtualdisplayError);
    });

    it('should throw error for non-string filename', () => {
      // @ts-expect-error Testing invalid input
      expect(() => snapshotApi.take(123)).toThrow(VirtualdisplayError);
      // @ts-expect-error Testing invalid input
      expect(() => snapshotApi.take(null)).toThrow(VirtualdisplayError);
      // @ts-expect-error Testing invalid input
      expect(() => snapshotApi.take(undefined)).toThrow(VirtualdisplayError);
    });

    it('should throw error for invalid extension', () => {
      const invalidFilenames = [
        'image.txt',
        'photo.doc',
        'picture',
        'image.',
        'photo.gif',
        'picture.bmp',
      ];

      invalidFilenames.forEach(filename => {
        expect(() => snapshotApi.take(filename)).toThrow(VirtualdisplayError);
      });
    });
  });
});

describe('Snapshot - validation tests', () => {
  let eventBus = new EventBus();
  let snapshotApi = new Snapshot(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    snapshotApi = new Snapshot(eventBus);
  });

  describe('take', () => {
    it('should throw error for path traversal attempts', () => {
      const maliciousFilenames = [
        '../image.png',
        '../../photo.jpg',
        'folder/image.png',
        'folder\\photo.jpg',
        'image..png',
      ];

      maliciousFilenames.forEach(filename => {
        expect(() => snapshotApi.take(filename)).toThrow(VirtualdisplayError);
      });
    });

    it('should use correct error code', () => {
      try {
        snapshotApi.take('invalid.txt');
      } catch (error) {
        expect(error).toBeInstanceOf(VirtualdisplayError);
        expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.INVALID_PARAMETER);
      }
    });
  });
});

describe('Snapshot integration', () => {
  let eventBus = new EventBus();
  let snapshotApi = new Snapshot(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    snapshotApi = new Snapshot(eventBus);
  });

  it('should complete full snapshot flow with message handler', async () => {
    const photo = snapshotApi.take('test-photo.png');
    const callback = vi.fn();

    photo.onDeveloped(callback);

    // Simulate server response
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename: 'test-photo.png',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
      },
    });

    expect(callback).toHaveBeenCalledWith({
      filename: 'test-photo.png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    });
  });

  it('should handle multiple concurrent snapshots', () => {
    const photo1 = snapshotApi.take('photo1.png');
    const photo2 = snapshotApi.take('photo2.png');
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    photo1.onDeveloped(callback1);
    photo2.onDeveloped(callback2);

    // Develop photo2 first
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename: 'photo2.png',
        data: 'data:image/png;base64,photo2data',
      },
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({
      filename: 'photo2.png',
      data: 'data:image/png;base64,photo2data',
    });

    // Then develop photo1
    eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename: 'photo1.png',
        data: 'data:image/png;base64,photo1data',
      },
    });

    expect(callback1).toHaveBeenCalledWith({
      filename: 'photo1.png',
      data: 'data:image/png;base64,photo1data',
    });
  });
});
