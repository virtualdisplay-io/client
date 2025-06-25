import { describe, expect, it, beforeEach } from 'vitest';

import { ERROR_CODES, type VirtualdisplayError, VirtualdisplayClient } from '../../../src';

describe('Error Codes Attribute Consistency', () => {
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

  it('should use consistent error codes for attribute errors', () => {
    // Set valid mapping and test attribute not found
    client.setMapping({
      attributes: [
        { name: 'Size', values: [{ value: 'Small', nodeIds: ['node1'] }] },
      ],
    });

    try {
      client.getAttribute('Color');
    } catch (error) {
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.ATTRIBUTE_NOT_FOUND);
    }

    // Test value not found
    const sizeAttribute = client.getAttribute('Size');
    try {
      sizeAttribute.select('Large');
    } catch (error) {
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.VALUE_NOT_FOUND);
    }
  });
});
