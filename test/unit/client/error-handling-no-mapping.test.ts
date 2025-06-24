import { describe, expect, it, beforeEach } from 'vitest';

import { VirtualdisplayClient, VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('VirtualdisplayClient No Mapping Errors', () => {
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

  it('should throw NO_MAPPING error when no mapping configured', () => {
    expect(() => {
      client.getAttribute('Color');
    }).toThrow(VirtualdisplayError);

    try {
      client.getAttribute('Color');
    } catch (error) {
      expect(error).toBeInstanceOf(VirtualdisplayError);
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.NO_MAPPING);
    }
  });
});
