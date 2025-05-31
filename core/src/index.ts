export { VirtualDisplayClient } from './client';
export { messageBus } from './message-bus';
export type { State, Attribute, AttributeValue } from './types/state';
export type {
  VirtualDisplayMessageEvent,
  VirtualDisplayMessageEventData,
} from './types/message';
export {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
  MESSAGE_EVENT_MODEL_TREE_RESPONSE,
} from './types/events';
