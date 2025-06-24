import Ajv from 'ajv';

import mappingSchema from './mapping-schema.json';
import type { MappingConfiguration } from './mapping-types';
import { VirtualdisplayError } from '../client/virtualdisplay-error';

/**
 * Validator for mapping configuration using AJV
 */
export class MappingValidator {
  private static readonly ajv = new Ajv({ allErrors: true, verbose: true });

  private static readonly validateFn = this.ajv.compile(mappingSchema);

  /**
   * Validate complete mapping configuration
   * @throws {VirtualdisplayError} When mapping configuration is invalid
   */
  public static validate(config: MappingConfiguration): void {
    if (!this.validateFn(config)) {
      // AJV already provides good error messages
      const errors = this.validateFn.errors!
        .map(err => err.message)
        .join(', ');

      throw VirtualdisplayError.invalidMapping(errors);
    }
  }
}
