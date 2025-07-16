// Main exports for Virtualdisplay Client
export { VirtualdisplayClient } from './client/virtualdisplay-client';
export type { ClientOptions } from './client/client-options';
export { VirtualdisplayError, ERROR_CODES, type ErrorCode } from './client/virtualdisplay-error';

// Public API types
export { AttributeSelector } from './attributes/attribute-selector';
export { NodeSelector } from './nodes/node-selector';
export { MappingValidator } from './attributes/mapping-validator';
export type { MappingConfiguration, AttributeConfig, AttributeValueConfig } from './attributes/mapping-types';

// Camera API
export { Camera } from './camera';

// UI configuration
export { VirtualdisplayViewerService } from './ui/virtualdisplay-viewer-service';

// Export mapping schema for external use
export { default as mappingSchema } from './attributes/mapping-schema.json';
export { NODE_TYPES, ModelNode } from './nodes/node';

// Event types for external listeners (if needed)
export { EVENT_NAMES } from './events/event-names';
export type { DomainEvents } from './events/event-types';

// Message types for server communication
export {
  MESSAGE_TYPES,
  type Message,
  type MutationMessage,
  type StateMessage,
  type ConfigMessage,
  type CameraMessage,
  type CameraCommand,
  type UIConfig,
  type ViewerConfig,
  type ModelNodeDto,
} from './messaging/message-types';
export { MUTATION_TYPES, Mutation, type MutationType, type MutationDto } from './mutations/mutation';

// Utilities for debugging
export { logger, enableDebugMode, isDebugMode } from './utils/logger';
