import {
  ObjectTreeRequestContext,
  ObjectTreeResponseContext,
} from '../types/tree';
import { State } from '../types/state';

const MESSAGE_EVENT_CLIENT_STATE: string = 'virtualDisplay.clientState';
const MESSAGE_EVENT_OBJECT_TREE: string = 'virtualDisplay.objectTree';

export enum VirtualDisplayRequestType {
  // @ts-ignore
  CLIENT_STATE = MESSAGE_EVENT_CLIENT_STATE,
  // @ts-ignore
  OBJECT_TREE = MESSAGE_EVENT_OBJECT_TREE,
}

export type VirtualDisplayRequest = {
  type: VirtualDisplayRequestType;
  context: ObjectTreeRequestContext | State;
};

export enum VirtualDisplayResponseType {
  // @ts-ignore
  OBJECT_TREE = MESSAGE_EVENT_OBJECT_TREE,
  // @ts-ignore
  CLIENT_STATE = MESSAGE_EVENT_CLIENT_STATE,
}

export type VirtualDisplayResponse = {
  type: VirtualDisplayResponseType;
  context: ObjectTreeResponseContext;
};
