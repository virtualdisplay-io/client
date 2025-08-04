/**
 * Event name constants for type-safe event communication
 */
export const EVENT_NAMES = {
  // Internal events
  IFRAME_READY: 'iframe:ready' as const,

  // Mutation flow (Client → Server)
  MUTATION_MESSAGE: 'mutation:message' as const,

  // Config flow (Client → Server)
  CONFIG_MESSAGE: 'config:message' as const,

  // Camera flow (Client → Server)
  CAMERA_MESSAGE: 'camera:message' as const,

  // State flow (Server → Client)
  MESSAGE_RECEIVED: 'message:received' as const,
  STATE_CHANGED: 'state:changed' as const,
  INITIAL_STATE_RECEIVED: 'state:initial-received' as const,

  // Snapshot flow
  SNAPSHOT_MESSAGE: 'snapshot:take' as const,
} as const;
