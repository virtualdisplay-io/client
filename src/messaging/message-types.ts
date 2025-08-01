import type { CameraConfig } from '../camera';
import type { MutationDto } from '../mutations/mutation';

/**
 * Types of messages exchanged between client and server
 * Using lowercase format to match server
 */
export const MESSAGE_TYPES = {
  MUTATION: 'mutation',
  STATE: 'state',
  CONFIG: 'config',
  CAMERA: 'camera',
  SNAPSHOT: 'snapshot',
} as const;


/**
 * DTO for model node data received from server
 */
export interface ModelNodeDto {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly visible: boolean;
}

/**
 * Mutation message sent to server
 */
export interface MutationMessage {
  readonly type: typeof MESSAGE_TYPES.MUTATION;
  readonly mutations: MutationDto[];
}

/**
 * State message received from server
 * Contains array of model node DTOs
 */
export interface StateMessage {
  readonly type: typeof MESSAGE_TYPES.STATE;
  readonly nodes: ModelNodeDto[];
  readonly isInitial: boolean;
}

/**
 * UI configuration options
 */
export interface UIConfig {
  readonly arEnabled?: boolean;
  readonly fullscreenEnabled?: boolean;
  readonly loadingIndicatorEnabled?: boolean;
}

/**
 * Viewer configuration
 */
export interface ViewerConfig {
  readonly ui?: UIConfig;
  readonly camera?: CameraConfig;
}

/**
 * Configuration message sent to server
 */
export interface ConfigMessage {
  readonly type: typeof MESSAGE_TYPES.CONFIG;
  readonly config: ViewerConfig;
}

/**
 * Camera command
 */
export interface CameraCommand {
  readonly action: 'rotate' | 'tilt' | 'zoom' | 'reset';
  readonly value?: number;
}

/**
 * Camera message sent to server
 */
export interface CameraMessage {
  readonly type: typeof MESSAGE_TYPES.CAMERA;
  readonly commands: CameraCommand[];
}

/**
 * Snapshot request message sent to server
 */
export interface SnapshotRequestMessage {
  readonly type: typeof MESSAGE_TYPES.SNAPSHOT;
  readonly filename: string;
}

/**
 * Snapshot developed message received from server
 */
export interface SnapshotDevelopedMessage {
  readonly type: typeof MESSAGE_TYPES.SNAPSHOT;
  readonly filename: string;
  readonly data: string;
}

/**
 * Union of all possible messages
 */
export type Message =
  | MutationMessage
  | StateMessage
  | ConfigMessage
  | CameraMessage
  | SnapshotRequestMessage
  | SnapshotDevelopedMessage;
