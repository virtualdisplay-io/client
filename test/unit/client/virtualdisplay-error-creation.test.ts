import { describe, expect, it } from 'vitest';

import { VirtualdisplayError, ERROR_CODES } from '../../../src';

describe('VirtualdisplayError Creation', () => {
  it('should create error with message and code', () => {
    const error = new VirtualdisplayError('Test message', ERROR_CODES.NO_MAPPING);

    expect(error.message).toBe('Test message');
    expect(error.code).toBe(ERROR_CODES.NO_MAPPING);
    expect(error.name).toBe('VirtualdisplayError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(VirtualdisplayError);
  });

  it('should maintain proper stack trace', () => {
    const error = new VirtualdisplayError('Test', ERROR_CODES.NO_MAPPING);
    expect(error.stack).toBeDefined();
  });
});
