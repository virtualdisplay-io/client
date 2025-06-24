/**
 * Error codes for Virtualdisplay client errors
 */
export const ERROR_CODES = {
  NO_MAPPING: 'NO_MAPPING',
  ATTRIBUTE_NOT_FOUND: 'ATTRIBUTE_NOT_FOUND',
  VALUE_NOT_FOUND: 'VALUE_NOT_FOUND',
  INVALID_MAPPING: 'INVALID_MAPPING',
  PARENT_NOT_FOUND: 'PARENT_NOT_FOUND',
  INVALID_MUTATIONS: 'INVALID_MUTATIONS',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Custom error class for Virtualdisplay client errors
 */
export class VirtualdisplayError extends Error {
  public readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'VirtualdisplayError';
    this.code = code;

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, VirtualdisplayError);
    }
  }

  public static noMapping(): VirtualdisplayError {
    return new VirtualdisplayError(
      'No mapping configured. Call setMapping() first.',
      ERROR_CODES.NO_MAPPING,
    );
  }

  public static attributeNotFound(attributeName: string): VirtualdisplayError {
    return new VirtualdisplayError(
      `Attribute "${attributeName}" not found in mapping`,
      ERROR_CODES.ATTRIBUTE_NOT_FOUND,
    );
  }

  public static valueNotFound(attributeName: string, valueName: string): VirtualdisplayError {
    return new VirtualdisplayError(
      `Value "${valueName}" not found for attribute "${attributeName}"`,
      ERROR_CODES.VALUE_NOT_FOUND,
    );
  }

  public static invalidMapping(reason?: string): VirtualdisplayError {
    const message = reason !== undefined
      ? `Invalid mapping configuration: ${reason}`
      : 'Invalid mapping configuration';

    return new VirtualdisplayError(message, ERROR_CODES.INVALID_MAPPING);
  }

  public static parentNotFound(selector: string): VirtualdisplayError {
    return new VirtualdisplayError(
      `Parent element not found: ${selector}`,
      ERROR_CODES.PARENT_NOT_FOUND,
    );
  }

  public static invalidMutations(reason?: string): VirtualdisplayError {
    const message = reason !== undefined
      ? `Invalid mutations: ${reason}`
      : 'Invalid mutations array';

    return new VirtualdisplayError(message, ERROR_CODES.INVALID_MUTATIONS);
  }
}
