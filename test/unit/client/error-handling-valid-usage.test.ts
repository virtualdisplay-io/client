import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient } from '../../../src';

describe('VirtualdisplayClient Valid Usage', () => {
  let client: VirtualdisplayClient = null as unknown as VirtualdisplayClient;

  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    client = new VirtualdisplayClient({
      parent: container,
      model: 'test-model.glb',
      license: 'test-license',
      debug: true,
    });
  });

  it('should work correctly with valid mapping and operations', () => {
    const validMapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Color',
          values: [
            { value: 'Red', nodeIds: ['node1'] },
          ],
        },
      ],
    };

    expect(() => {
      client.setMapping(validMapping);
    }).not.toThrow();

    expect(() => {
      const colorAttribute = client.getAttribute('Color');
      colorAttribute.select('Red');
    }).not.toThrow();
  });
});
