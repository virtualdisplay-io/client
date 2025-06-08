import { VirtualDisplayClient } from '../../../core/src';

export const createVirtualDisplayClient = (): VirtualDisplayClient => {
  return VirtualDisplayClient.builder({
    parent: '#virtual-display-placeholder',
    license: 'demo',
    model: 'Tafels_variants',
    style: { minHeight: '340px', border: 'none' },
    title: 'Table of Infinite Awesomeness',
    classNames: 'bg-white shadow-lg rounded-lg h-full w-full',
  });
};
