import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient, VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('VirtualdisplayClient - Invalid Mapping Error', () => {
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

  it('should throw INVALID_MAPPING error for invalid configuration', () => {
    const invalidMapping = {
      attributes: 'not-an-array', // Invalid structure
    };

    expect(() => {
      client.setMapping(invalidMapping as unknown as MappingConfiguration);
    }).toThrow(VirtualdisplayError);

    try {
      client.setMapping(invalidMapping as unknown as MappingConfiguration);
    } catch (error) {
      expect(error).toBeInstanceOf(VirtualdisplayError);
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.INVALID_MAPPING);
    }
  });
});
