import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient, VirtualdisplayError } from '../../../src';

describe('Complete Error Flow', () => {
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

  it('should handle mapping validation -> attribute access -> value selection errors', () => {
    // 1. Mapping validation error
    expect(() => {
      client.setMapping({ attributes: [] });
    }).toThrow(VirtualdisplayError);

    // 2. No mapping error
    expect(() => {
      client.getAttribute('Color');
    }).toThrow(VirtualdisplayError);

    // 3. Valid mapping
    const validMapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Size',
          values: [
            { value: 'Small', nodeIds: ['node1'] },
          ],
        },
      ],
    };

    client.setMapping(validMapping);

    // 4. Attribute not found error
    expect(() => {
      client.getAttribute('Color');
    }).toThrow(VirtualdisplayError);

    // 5. Valid attribute access
    const sizeAttribute = client.getAttribute('Size');
    expect(sizeAttribute).toBeDefined();

    // 6. Value not found error
    expect(() => {
      sizeAttribute.select('Large');
    }).toThrow(VirtualdisplayError);

    // 7. Valid value selection
    expect(() => {
      sizeAttribute.select('Small');
    }).not.toThrow();
  });
});
