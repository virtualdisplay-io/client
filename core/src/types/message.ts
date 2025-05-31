import {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
  MESSAGE_EVENT_MODEL_TREE_RESPONSE,
} from './events';
import { State } from './state';
import { ModelTreeRequestContext } from './tree-request';

export type VirtualDisplayMessageEvent =
  | typeof MESSAGE_EVENT_SEND_CLIENT_STATE
  | typeof MESSAGE_EVENT_MODEL_TREE_REQUEST
  | typeof MESSAGE_EVENT_MODEL_TREE_RESPONSE;

/**
 * Represents our definition of the PostMessage event object.
 * Extends the native MessageEvent to enforce a specific data structure.
 */
export interface VirtualDisplayMessageEventData<
  T = State | ModelTreeRequestContext | null,
> {
  type: VirtualDisplayMessageEvent;
  context: T | null;
}
