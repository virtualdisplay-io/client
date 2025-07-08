/**
 * Event name constants for type-safe event communication
 */
export const EVENT_NAMES = {
  // Internal events
  IFRAME_READY: 'iframe:ready' as const,

  // Mutation flow (Client → Server)
  MUTATION_MESSAGE: 'mutation:message' as const,

  // State flow (Server → Client)
  MESSAGE_RECEIVED: 'message:received' as const,
  STATE_CHANGED: 'state:changed' as const,
  INITIAL_STATE_RECEIVED: 'state:initial-received' as const,
} as const;

/**
 * Type for all valid event names
 */
export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];
