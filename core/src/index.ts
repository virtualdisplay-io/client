export { VirtualDisplayClient } from './client';
export { messageBus } from './message-bus';
export type { State, Attribute, AttributeValue } from './types/state';
export type {
  VirtualDisplayMessageEvent,
  VirtualDisplayMessageEventData,
} from './types/virtual-display-message-event';
export {
  MESSAGE_EVENT_GET_MODEL_TREE,
  MESSAGE_EVENT_SEND_CLIENT_STATE,
  MESSAGE_EVENT_SET_MODEL_STATE,
  MESSAGE_EVENT_SEND_MODEL_TREE,
} from './types/message-events';
