import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { MESSAGE_TYPES, type CameraCommand, type CameraMessage } from '../messaging/message-types';

/**
 * Camera control API for positioning and zoom
 * Uses chaining pattern for building commands
 */
export class Camera {
  private commands: CameraCommand[] = [];

  constructor(
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Rotate camera horizontally
   * @param degrees - Absolute rotation in degrees (0 = front view)
   */
  public rotate(degrees: number): this {
    this.commands.push({ action: 'rotate', value: degrees });
    return this;
  }

  /**
   * Tilt camera vertically
   * @param degrees - Absolute tilt in degrees (0 = top view, 90 = horizontal)
   */
  public tilt(degrees: number): this {
    this.commands.push({ action: 'tilt', value: degrees });
    return this;
  }

  /**
   * Zoom camera
   * @param percentage - Zoom percentage (100 = normal, >100 = zoom in, <100 = zoom out)
   */
  public zoom(percentage: number): this {
    this.commands.push({ action: 'zoom', value: percentage });
    return this;
  }

  /**
   * Execute accumulated camera commands
   */
  public set(): void {
    if (this.commands.length === 0) {
      return;
    }

    const message: CameraMessage = {
      type: MESSAGE_TYPES.CAMERA,
      commands: this.commands,
    };

    this.eventBus.emit(EVENT_NAMES.CAMERA_MESSAGE, { message });

    this.commands = [];
  }

  /**
   * Reset camera to initial position
   * This is not chainable and executes immediately
   */
  public reset(): void {
    const message: CameraMessage = {
      type: MESSAGE_TYPES.CAMERA,
      commands: [{ action: 'reset' }],
    };

    this.eventBus.emit(EVENT_NAMES.CAMERA_MESSAGE, { message });
  }
}
