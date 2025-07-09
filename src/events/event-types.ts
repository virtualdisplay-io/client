import type { EVENT_NAMES } from './event-names';
import type { MutationMessage, ConfigMessage, Message } from '../messaging/message-types';
import type { ModelNode } from '../nodes/node';

export interface VoidEvent {}

/**
 * Generic message event - used for all message passing
 */
export interface MessageEvent<T extends Message = Message> {
  message: T;
}

export interface StateChangedEvent {
  nodes: ModelNode[];
}

/**
 * Central Event Registry
 */
export interface DomainEvents extends Record<string, unknown> {
  // Internal events
  [EVENT_NAMES.IFRAME_READY]: VoidEvent;

  // Mutation flow (Client → Server)
  [EVENT_NAMES.MUTATION_MESSAGE]: MessageEvent<MutationMessage>;

  // Config flow (Client → Server)
  [EVENT_NAMES.CONFIG_MESSAGE]: MessageEvent<ConfigMessage>;

  // State flow (Server → Client)
  [EVENT_NAMES.MESSAGE_RECEIVED]: MessageEvent;
  [EVENT_NAMES.STATE_CHANGED]: StateChangedEvent;
  [EVENT_NAMES.INITIAL_STATE_RECEIVED]: VoidEvent;
}
