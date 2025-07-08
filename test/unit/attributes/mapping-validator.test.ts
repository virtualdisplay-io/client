import { describe, it, expect } from 'vitest';

import { type MappingConfiguration, MappingValidator, VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('MappingValidator', () => {
  it('should accept valid mapping configuration', () => {
    const validMapping = {
      attributes: [
        {
          name: 'Color',
          values: [
            {
              value: 'Red',
              nodeIds: ['node1', 'node2'],
              isSelected: true,
            },
            {
              value: 'Blue',
              nodeIds: ['node3'],
            },
          ],
        },
      ],
    };

    // Should not throw
    expect(() => MappingValidator.validate(validMapping)).not.toThrow();
  });

  it('should throw VirtualdisplayError for invalid mapping', () => {
    const invalidMapping = {
      // Missing required 'attributes' field
    };

    expect(() => MappingValidator.validate(invalidMapping as unknown as MappingConfiguration))
      .toThrow(VirtualdisplayError);

    try {
      MappingValidator.validate(invalidMapping as unknown as MappingConfiguration);
    } catch (error) {
      expect((error as VirtualdisplayError).code).toBe(ERROR_CODES.INVALID_MAPPING);
    }
  });

  it('should validate against the JSON schema', () => {
    // Empty attributes array (minItems: 1)
    const emptyAttributes = { attributes: [] };

    expect(() => MappingValidator.validate(emptyAttributes as unknown as MappingConfiguration))
      .toThrow(VirtualdisplayError);
  });
});
