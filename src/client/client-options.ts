import type { CameraConfig } from '../camera';
import type { UIConfig } from '../messaging/message-types';

/**
 * Configuration options for VirtualdisplayClient
 */
export interface ClientOptions {
  readonly parent: string | HTMLElement;
  readonly model: string;
  readonly license: string;
  readonly debug?: boolean;
  readonly language?: string;

  // UI configuration options
  readonly arEnabled?: boolean;
  readonly fullscreenEnabled?: boolean;
  readonly loadingIndicatorEnabled?: boolean;

  // UI configuration object (alternative way to configure UI)
  readonly ui?: UIConfig;

  // Camera configuration options
  readonly camera?: CameraConfig;
}
