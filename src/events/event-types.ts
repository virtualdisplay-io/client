import type { EVENT_NAMES } from './event-names';
import type { MutationMessage } from '../messaging/message-types';
import type { ModelNode } from '../nodes/node';

export interface VoidEvent {}

/**
 * Mutation Flow Events (Client → Server)
 */
export interface MutationMessageEvent {
  message: MutationMessage;
}

/**
 * State Flow Events (Server → Client)
 */
export interface MessageReceivedEvent {
  message: unknown;
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
  [EVENT_NAMES.MUTATION_MESSAGE]: MutationMessageEvent;

  // State flow (Server → Client)
  [EVENT_NAMES.MESSAGE_RECEIVED]: MessageReceivedEvent;
  [EVENT_NAMES.STATE_CHANGED]: StateChangedEvent;
}

export type EventName = keyof DomainEvents;
