import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Camera, EVENT_NAMES, MESSAGE_TYPES } from '../../../src';
import type { EventBus } from '../../../src/events/event-bus';

describe('Camera', () => {
  let camera: Camera = null as unknown as Camera;
  let mockEventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    mockEventBus = {
      emit: vi.fn(),
    } as unknown as EventBus;

    camera = new Camera(mockEventBus);
  });

  describe('command accumulation', () => {
    it('should accumulate commands until set() is called', () => {
      camera.rotate(45).tilt(30).zoom(150);

      expect(mockEventBus.emit).not.toHaveBeenCalled();

      camera.set();

      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        EVENT_NAMES.CAMERA_MESSAGE,
        {
          message: {
            type: MESSAGE_TYPES.CAMERA,
            commands: [
              { action: 'rotate', value: 45 },
              { action: 'tilt', value: 30 },
              { action: 'zoom', value: 150 },
            ],
          },
        },
      );
    });

    it('should clear commands after set()', () => {
      camera.rotate(45).set();
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);

      camera.set();
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1); // Still 1, no new call
    });

    it('should not emit when no commands are accumulated', () => {
      camera.set();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('chaining', () => {
    it('should return camera instance for chaining', () => {
      expect(camera.rotate(0)).toBe(camera);
      expect(camera.tilt(0)).toBe(camera);
      expect(camera.zoom(100)).toBe(camera);
    });
  });

  describe('event bus integration', () => {
    it('should use event bus instead of direct messaging', () => {
      camera.rotate(90).set();

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        EVENT_NAMES.CAMERA_MESSAGE,
        expect.any(Object),
      );
    });
  });
});
