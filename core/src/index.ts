export { VirtualDisplayClient } from './client';
export { responseDispatcher } from './message/dispatcher';
export type { State, Attribute, AttributeValue } from './types/state';
export type {
  ObjectTree,
  ObjectTreeNode,
  ObjectTreeRequestContext,
  ObjectTreeResponseContext,
} from './types/tree';
export type {
  VirtualDisplayRequest,
  VirtualDisplayResponse,
} from './message/message';
export {
  VirtualDisplayRequestType,
  VirtualDisplayResponseType,
} from './message/message';
export type { VirtualDisplayClientOptions } from './iframe/options';

// Accessibility utilities
export {
  announceToScreenReader,
  createScreenReaderAnnouncer,
  manageFocus,
  trapFocus,
  addKeyboardNavigation,
  createDebouncedAnnouncer,
} from './utils/accessibility';

// Logger utilities
export { logger } from './utils/logger';
export type { Logger } from './utils/logger';
