import {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
  MESSAGE_EVENT_SET_MODEL_STATE,
  MESSAGE_EVENT_MODEL_TREE_RESPONSE,
} from './message-events';

export type VirtualDisplayMessageEvent =
  | typeof MESSAGE_EVENT_SEND_CLIENT_STATE
  | typeof MESSAGE_EVENT_SET_MODEL_STATE
  | typeof MESSAGE_EVENT_MODEL_TREE_REQUEST
  | typeof MESSAGE_EVENT_MODEL_TREE_RESPONSE;

/**
 * Represents our definition of the PostMessage event object.
 * Extends the native MessageEvent to enforce a specific data structure.
 */
export interface VirtualDisplayMessageEventData<T = unknown> {
  type: VirtualDisplayMessageEvent;
  context: T | null;
}
