import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Camera, EVENT_NAMES, MESSAGE_TYPES } from '../../../src';
import type { EventBus } from '../../../src/events/event-bus';

describe('Camera - reset', () => {
  let camera: Camera = null as unknown as Camera;
  let mockEventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    mockEventBus = {
      emit: vi.fn(),
    } as unknown as EventBus;

    camera = new Camera(mockEventBus);
  });

  it('should send reset command immediately without requiring set()', () => {
    camera.reset();

    expect(mockEventBus.emit).toHaveBeenCalledWith(
      EVENT_NAMES.CAMERA_MESSAGE,
      {
        message: {
          type: MESSAGE_TYPES.CAMERA,
          commands: [{ action: 'reset' }],
        },
      },
    );
  });

  it('should not clear pending commands', () => {
    camera.rotate(45);
    camera.reset();

    expect(mockEventBus.emit).toHaveBeenCalledTimes(1); // Only reset

    camera.set();
    expect(mockEventBus.emit).toHaveBeenCalledTimes(2); // Reset + rotate
  });
});
