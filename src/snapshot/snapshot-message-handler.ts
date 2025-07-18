import type { Photo, PhotoData } from './photo';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { MESSAGE_TYPES, type Message, type SnapshotDevelopedMessage } from '../messaging/message-types';
import { logger } from '../utils/logger';

/**
 * Handles incoming snapshot messages and develops photos
 * Separates messaging concerns from domain objects
 */
export class SnapshotMessageHandler {
  private readonly pendingPhotos = new Map<string, Photo>();

  constructor(
    private readonly eventBus: EventBus,
  ) {
    logger.debug('SnapshotMessageHandler initialized');
    this.setupMessageListener();
  }

  /**
   * Register a photo to be developed when its data arrives
   */
  public registerPhoto(photo: Photo): void {
    logger.debug('Registering photo for development', { filename: photo.getFilename() });
    this.pendingPhotos.set(photo.getFilename(), photo);
    logger.debug('Pending photos count', { count: this.pendingPhotos.size });
  }

  private setupMessageListener(): void {
    logger.debug('Setting up message listener for snapshot messages');
    this.eventBus.on(EVENT_NAMES.MESSAGE_RECEIVED, event => {
      const { message } = event as { message: Message };

      if (message.type === MESSAGE_TYPES.SNAPSHOT) {
        logger.debug('Processing snapshot message');
        this.handleSnapshotDeveloped(message as SnapshotDevelopedMessage);
      }
    });
  }

  private handleSnapshotDeveloped(message: SnapshotDevelopedMessage): void {
    logger.debug('Handling snapshot developed message', {
      filename: message.filename,
      dataLength: message.data.length,
      pendingCount: this.pendingPhotos.size,
    });

    const photo = this.pendingPhotos.get(message.filename);

    if (photo !== undefined) {
      logger.debug('Found pending photo, developing...', { filename: message.filename });

      const photoData: PhotoData = {
        filename: message.filename,
        data: message.data,
      };

      photo.develop(photoData);
      this.pendingPhotos.delete(message.filename);

      logger.debug('Photo developed and removed from pending', {
        filename: message.filename,
        remainingCount: this.pendingPhotos.size,
      });
      return;
    }
    logger.warn('No pending photo found for filename', {
      filename: message.filename,
      pendingFilenames: Array.from(this.pendingPhotos.keys()),
    });
  }
}
