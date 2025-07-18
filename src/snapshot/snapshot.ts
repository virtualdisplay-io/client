import { Photo } from './photo';
import { SnapshotMessageHandler } from './snapshot-message-handler';
import { VirtualdisplayError, ERROR_CODES } from '../client/virtualdisplay-error';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { MESSAGE_TYPES } from '../messaging/message-types';
import { logger } from '../utils/logger';

/**
 * API for taking screenshots of the 3D model
 * Following the camera analogy: take() triggers capture, onDeveloped() gets result
 */
export class Snapshot {
  private readonly validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  private readonly messageHandler: SnapshotMessageHandler;

  constructor(
    private readonly eventBus: EventBus,
  ) {
    this.messageHandler = new SnapshotMessageHandler(eventBus);
  }

  /**
   * Take a snapshot of the current 3D model view
   *
   * @param filename The filename for the snapshot (must include valid extension)
   * @returns Photo object for registering callbacks
   * @throws VirtualdisplayError if filename is invalid
   */
  public take(filename: string): Photo {
    // Validate filename
    this.validateFilename(filename);

    logger.debug('Taking snapshot', { filename });

    // Create photo object (pure domain object)
    const photo = new Photo(filename);

    // Register photo with message handler
    this.messageHandler.registerPhoto(photo);

    // Emit snapshot message
    this.eventBus.emit(EVENT_NAMES.SNAPSHOT_MESSAGE, {
      message: {
        type: MESSAGE_TYPES.SNAPSHOT,
        filename,
      },
    });

    return photo;
  }

  /**
   * Validate filename has a valid image extension
   */
  private validateFilename(filename: string): void {
    if (filename === '' || typeof filename !== 'string') {
      throw new VirtualdisplayError(
        'Filename must be a non-empty string',
        ERROR_CODES.INVALID_PARAMETER,
      );
    }

    const hasValidExtension = this.validExtensions.some(
      ext => filename.toLowerCase().endsWith(ext),
    );

    if (!hasValidExtension) {
      throw new VirtualdisplayError(
        `Invalid filename: "${filename}". Filename must end with one of: ${this.validExtensions.join(', ')}`,
        ERROR_CODES.INVALID_PARAMETER,
      );
    }

    // Additional validation for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new VirtualdisplayError(
        'Filename cannot contain path separators or ".."',
        ERROR_CODES.INVALID_PARAMETER,
      );
    }
  }
}
