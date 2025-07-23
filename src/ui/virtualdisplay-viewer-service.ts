import type { CameraConfig } from '../camera/camera-config';
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
   * Supports both individual properties and ui object
   */
  public sendInitialConfig(options: ClientOptions): void {
    const uiConfig = this.buildUIConfig(options);
    const viewerConfig = this.buildViewerConfig(uiConfig, options.camera);

    if (viewerConfig !== undefined) {
      this.sendConfig(viewerConfig);
    }
  }

  /**
   * Build UI configuration from client options
   *
   * Supports both legacy properties (options.arEnabled) and the newer ui object
   * for backward compatibility. Legacy properties take precedence when both exist.
   */
  private buildUIConfig(options: ClientOptions): UIConfig | undefined {
    const uiValues = this.extractUIValues(options);

    // Only send message when UI options are explicitly configured
    const hasUIConfig = Object.values(uiValues).some(value => value !== undefined);
    if (!hasUIConfig) {
      return undefined;
    }

    return {
      ...(uiValues.arEnabled !== undefined && { arEnabled: uiValues.arEnabled }),
      ...(uiValues.fullscreenEnabled !== undefined && {
        fullscreenEnabled: uiValues.fullscreenEnabled,
      }),
      ...(uiValues.loadingIndicatorEnabled !== undefined && {
        loadingIndicatorEnabled: uiValues.loadingIndicatorEnabled,
      }),
    };
  }

  /**
   * Extract UI values from options, with legacy properties taking precedence
   */
  private extractUIValues(options: ClientOptions): {
    arEnabled: boolean | undefined;
    fullscreenEnabled: boolean | undefined;
    loadingIndicatorEnabled: boolean | undefined;
  } {
    return {
      arEnabled: options.arEnabled ?? options.ui?.arEnabled,
      fullscreenEnabled: options.fullscreenEnabled ?? options.ui?.fullscreenEnabled,
      loadingIndicatorEnabled:
        options.loadingIndicatorEnabled ?? options.ui?.loadingIndicatorEnabled,
    };
  }

  /**
   * Build viewer configuration from UI config and camera config
   */
  private buildViewerConfig(
    uiConfig: UIConfig | undefined,
    cameraConfig: CameraConfig | undefined,
  ): ViewerConfig | undefined {
    if (uiConfig === undefined && cameraConfig === undefined) {
      return undefined;
    }

    return {
      ...(uiConfig !== undefined && { ui: uiConfig }),
      ...(cameraConfig !== undefined && { camera: cameraConfig }),
    };
  }

  /**
   * Update AR button visibility
   */
  public setArEnabled(enabled: boolean): void {
    logger.debug(`Setting AR button enabled: ${enabled}`);
    this.updateUIConfig({ arEnabled: enabled });
  }

  /**
   * Update fullscreen button visibility
   */
  public setFullscreenEnabled(enabled: boolean): void {
    logger.debug(`Setting fullscreen button enabled: ${enabled}`);
    this.updateUIConfig({ fullscreenEnabled: enabled });
  }

  /**
   * Update loading indicator visibility
   */
  public setLoadingIndicatorEnabled(enabled: boolean): void {
    logger.debug(`Setting loading indicator enabled: ${enabled}`);
    this.updateUIConfig({ loadingIndicatorEnabled: enabled });
  }

  /**
   * Update multiple UI settings at once
   */
  public updateUIConfig(config: Partial<UIConfig>): void {
    logger.debug('Updating UI configuration', config);

    if (Object.keys(config).length > 0) {
      this.sendConfig({ ui: config as UIConfig });
    }
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
    this.sendConfig({ ui: uiConfig });
  }

  /**
   * Send full viewer configuration to server
   */
  private sendConfig(config: ViewerConfig): void {
    const message: ConfigMessage = {
      type: MESSAGE_TYPES.CONFIG,
      config,
    };

    logger.debug('Sending config', message);

    this.eventBus.emit(EVENT_NAMES.CONFIG_MESSAGE, { message });
  }
}
