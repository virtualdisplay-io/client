import { describe, expect, it, beforeEach } from 'vitest';

import { VirtualdisplayError, ERROR_CODES, MappingValidator, VirtualdisplayClient } from '../../../src';

describe('Error Validator Integration', () => {
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

  it('should use MappingValidator for validation', () => {
    const invalidMapping = { attributes: [] };

    // Test that MappingValidator throws the error
    expect(() => {
      MappingValidator.validate(invalidMapping);
    }).toThrow(VirtualdisplayError);

    // Test that client.setMapping also throws the error (via AttributeService)
    expect(() => {
      client.setMapping(invalidMapping);
    }).toThrow(VirtualdisplayError);

    try {
      client.setMapping(invalidMapping);
    } catch (error) {
      expect(error).toBeInstanceOf(VirtualdisplayError);
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.INVALID_MAPPING);
    }
  });
});
