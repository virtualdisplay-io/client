import type { MutationDto } from '../mutations/mutation';

/**
 * Types of messages exchanged between client and server
 * Using lowercase format to match server
 */
export const MESSAGE_TYPES = {
  MUTATION: 'mutation',
  STATE: 'state',
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

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
 * Base message interface
 */
export interface BaseMessage {
  readonly type: MessageType;
}

/**
 * Mutation message sent to server
 */
export interface MutationMessage extends BaseMessage {
  readonly type: typeof MESSAGE_TYPES.MUTATION;
  readonly mutations: MutationDto[];
}

/**
 * State message received from server
 * Contains array of model node DTOs
 */
export interface StateMessage extends BaseMessage {
  readonly type: typeof MESSAGE_TYPES.STATE;
  readonly nodes: ModelNodeDto[];
  readonly isInitial: boolean;
}

/**
 * Union of all possible messages
 */
export type Message = MutationMessage | StateMessage;
