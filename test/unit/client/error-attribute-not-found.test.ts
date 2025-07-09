import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient, VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('VirtualdisplayClient - Attribute Not Found Error', () => {
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

  it('should throw ATTRIBUTE_NOT_FOUND error when attribute does not exist', () => {
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

    expect(() => {
      client.getAttribute('Color');
    }).toThrow(VirtualdisplayError);

    try {
      client.getAttribute('Color');
    } catch (error) {
      expect(error).toBeInstanceOf(VirtualdisplayError);
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.ATTRIBUTE_NOT_FOUND);
    }
  });
});
