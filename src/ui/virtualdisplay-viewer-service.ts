import type { ClientOptions } from '../client/client-options';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { MESSAGE_TYPES, type ConfigMessage, type UIConfig, type ViewerConfig } from '../messaging/message-types';
import { logger } from '../utils/logger';

/**
 * Service responsible for managing viewer UI configuration
 * Sends CONFIG messages to control AR button, fullscreen button, and loading indicator
 */
export class VirtualdisplayViewerService {
  private readonly eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Send initial configuration based on client options
   * Only sends config when values are false (server defaults to true)
   */
  public sendInitialConfig(options: ClientOptions): void {
    const config: {
      arEnabled?: boolean;
      fullscreenEnabled?: boolean;
      loadingIndicatorEnabled?: boolean;
    } = {};

    // Only send if explicitly disabled (server defaults to true)
    if (options.arEnabled === false) {
      config.arEnabled = false;
    }

    if (options.fullscreenEnabled === false) {
      config.fullscreenEnabled = false;
    }

    if (options.loadingIndicatorEnabled === false) {
      config.loadingIndicatorEnabled = false;
    }

    // Only send if we have any config to send
    if (Object.keys(config).length > 0) {
      logger.debug('Sending initial UI configuration', config);
      this.sendUIConfig(config);
    }
  }

  /**
   * Update AR button visibility
   */
  public setArEnabled(enabled: boolean): void {
    logger.debug(`Setting AR button enabled: ${enabled}`);
    this.sendUIConfig({ arEnabled: enabled });
  }

  /**
   * Update fullscreen button visibility
   */
  public setFullscreenEnabled(enabled: boolean): void {
    logger.debug(`Setting fullscreen button enabled: ${enabled}`);
    this.sendUIConfig({ fullscreenEnabled: enabled });
  }

  /**
   * Update loading indicator visibility
   */
  public setLoadingIndicatorEnabled(enabled: boolean): void {
    logger.debug(`Setting loading indicator enabled: ${enabled}`);
    this.sendUIConfig({ loadingIndicatorEnabled: enabled });
  }

  /**
   * Update multiple UI settings at once
   */
  public updateUIConfig(config: Partial<UIConfig>): void {
    logger.debug('Updating UI configuration', config);
    this.sendUIConfig(config);
  }

  /**
   * Hide all UI elements
   */
  public hideAllUI(): void {
    logger.debug('Hiding all UI elements');
    this.sendUIConfig({
      arEnabled: false,
      fullscreenEnabled: false,
      loadingIndicatorEnabled: false,
    });
  }

  /**
   * Show all UI elements
   */
  public showAllUI(): void {
    logger.debug('Showing all UI elements');
    this.sendUIConfig({
      arEnabled: true,
      fullscreenEnabled: true,
      loadingIndicatorEnabled: true,
    });
  }

  /**
   * Send UI configuration to server
   */
  private sendUIConfig(uiConfig: Partial<UIConfig>): void {
    const config: ViewerConfig = { ui: uiConfig };
    const message: ConfigMessage = {
      type: MESSAGE_TYPES.CONFIG,
      config,
    };

    logger.debug('Emitting CONFIG message', message);
    this.eventBus.emit(EVENT_NAMES.CONFIG_MESSAGE, { message });
  }
}
