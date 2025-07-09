import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient, VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('VirtualdisplayClient - Value Not Found Error', () => {
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

  it('should throw VALUE_NOT_FOUND error when selecting non-existent value', () => {
    const validMapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Color',
          values: [
            { value: 'Red', nodeIds: ['node1'] },
            { value: 'Blue', nodeIds: ['node2'] },
          ],
        },
      ],
    };

    client.setMapping(validMapping);
    const attribute = client.getAttribute('Color');

    expect(() => {
      attribute?.select('Green');
    }).toThrow(VirtualdisplayError);

    try {
      attribute?.select('Green');
    } catch (error) {
      expect(error).toBeInstanceOf(VirtualdisplayError);
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.VALUE_NOT_FOUND);
    }
  });
});
