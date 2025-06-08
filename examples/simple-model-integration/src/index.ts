import {
  VirtualDisplayClient,
  VirtualDisplayClientOptions,
} from '../../../core/src';

const options: VirtualDisplayClientOptions = {
  parent: '#virtual-display-placeholder',
  license: 'demo',
  model: 'shopx',
  style: { background: '#f9fafb' },
  title: 'Simple 3D Model Integration',
  classNames: 'w-full h-full min-h-[350px] rounded-lg border-0',
};

VirtualDisplayClient.builder(options);
