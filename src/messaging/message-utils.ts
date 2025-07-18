import {
  MESSAGE_TYPES,
  type Message,
  type MutationMessage,
  type StateMessage,
  type SnapshotDevelopedMessage,
} from './message-types';
import { VirtualdisplayError } from '../client/virtualdisplay-error';
import type { Mutation } from '../mutations/mutation';

/**
 * Create a mutation message from client mutations
 */
export function createMutationMessage(mutations: Mutation[]): MutationMessage {
  if (!Array.isArray(mutations)) {
    throw VirtualdisplayError.invalidMutations('must be an array');
  }

  return {
    type: MESSAGE_TYPES.MUTATION,
    mutations: mutations.map(m => m.toDto()),
  };
}

/**
 * Type guard for any valid message
 */
export function isValidMessage(data: unknown): data is Message {
  return (
    isStateMessage(data) ||
    isSnapshotDevelopedMessage(data)
  );
}

/**
 * Type guard for state messages
 */
export function isStateMessage(data: unknown): data is StateMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    obj.type === MESSAGE_TYPES.STATE &&
    Array.isArray(obj.nodes)
  );
}

/**
 * Type guard for snapshot developed messages
 */
export function isSnapshotDevelopedMessage(data: unknown): data is SnapshotDevelopedMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    obj.type === MESSAGE_TYPES.SNAPSHOT &&
    typeof obj.filename === 'string' &&
    typeof obj.data === 'string'
  );
}
