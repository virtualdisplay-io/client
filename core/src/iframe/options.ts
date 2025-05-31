import { VirtualDisplayClient } from '../client';
import { VirtualDisplayResponse } from '../message/message';

export interface VirtualDisplayClientOptions {
  parent: string | HTMLElement;
  license: string;
  model: string;
  debug?: boolean;
  title?: string;
  onReady?: (client: VirtualDisplayClient) => void;
  onResponse?: (response: VirtualDisplayResponse) => void;
  iframeId?: string;
  style?: Partial<CSSStyleDeclaration>;
  classNames?: string;
}
