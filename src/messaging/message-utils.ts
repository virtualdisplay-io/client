import { MESSAGE_TYPES, type Message, type MutationMessage, type StateMessage } from './message-types';
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
  return isMutationMessage(data) || isStateMessage(data);
}

/**
 * Type guard for mutation messages
 */
export function isMutationMessage(data: unknown): data is MutationMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    obj.type === MESSAGE_TYPES.MUTATION &&
    Array.isArray(obj.mutations)
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
