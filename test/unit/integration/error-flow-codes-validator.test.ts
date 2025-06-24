import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, ERROR_CODES, type VirtualdisplayError, MappingValidator, VirtualdisplayClient } from '../../../src';

describe('Error Codes Validator Consistency', () => {
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

  it('should use consistent error codes for validator errors', () => {
    // Validator error
    try {
      MappingValidator.validate(null as unknown as MappingConfiguration);
    } catch (error) {
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.INVALID_MAPPING);
    }

    // Client getAttribute error
    try {
      client.getAttribute('Color');
    } catch (error) {
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.NO_MAPPING);
    }
  });
});
