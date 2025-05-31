import { VirtualDisplayClient } from '../../../core/src';

export const createVirtualDisplayClient = (): VirtualDisplayClient => {
  return new VirtualDisplayClient('#virtual-display-iframe');
};
