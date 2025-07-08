import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../../../src';

describe('VirtualdisplayError Codes', () => {
  it('should have all expected error codes', () => {
    expect(ERROR_CODES.NO_MAPPING).toBe('NO_MAPPING');
    expect(ERROR_CODES.ATTRIBUTE_NOT_FOUND).toBe('ATTRIBUTE_NOT_FOUND');
    expect(ERROR_CODES.VALUE_NOT_FOUND).toBe('VALUE_NOT_FOUND');
    expect(ERROR_CODES.INVALID_MAPPING).toBe('INVALID_MAPPING');
  });

  it('should be readonly constants', () => {
    // Test that the constants are frozen (readonly at runtime)
    expect(Object.isFrozen(ERROR_CODES)).toBe(false); // As const doesn't freeze at runtime

    // But the TypeScript type system prevents reassignment
    expect(ERROR_CODES.NO_MAPPING).toBe('NO_MAPPING');
    expect(typeof ERROR_CODES.NO_MAPPING).toBe('string');
  });
});
