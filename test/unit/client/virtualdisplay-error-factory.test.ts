import { describe, expect, it } from 'vitest';

import { VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('VirtualdisplayError Factory Methods', () => {
  it('should create noMapping error', () => {
    const error = VirtualdisplayError.noMapping();

    expect(error.message).toBe('No mapping configured. Call setMapping() first.');
    expect(error.code).toBe(ERROR_CODES.NO_MAPPING);
  });

  it('should create attributeNotFound error', () => {
    const error = VirtualdisplayError.attributeNotFound('Color');

    expect(error.message).toBe('Attribute "Color" not found in mapping');
    expect(error.code).toBe(ERROR_CODES.ATTRIBUTE_NOT_FOUND);
  });

  it('should create valueNotFound error', () => {
    const error = VirtualdisplayError.valueNotFound('Color', 'Red');

    expect(error.message).toBe('Value "Red" not found for attribute "Color"');
    expect(error.code).toBe(ERROR_CODES.VALUE_NOT_FOUND);
  });

  it('should create invalidMapping error without reason', () => {
    const error = VirtualdisplayError.invalidMapping();

    expect(error.message).toBe('Invalid mapping configuration');
    expect(error.code).toBe(ERROR_CODES.INVALID_MAPPING);
  });

  it('should create invalidMapping error with reason', () => {
    const error = VirtualdisplayError.invalidMapping('Missing attributes array');

    expect(error.message).toBe('Invalid mapping configuration: Missing attributes array');
    expect(error.code).toBe(ERROR_CODES.INVALID_MAPPING);
  });
});
