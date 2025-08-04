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
    if (config === null || config === undefined) {
      throw VirtualdisplayError.invalidMapping('Mapping configuration cannot be null or undefined');
    }

    // Check if mapping contains dynamic values (functions)
    if (this.containsDynamicValues(config)) {
      // Skip JSON schema validation for dynamic mappings
      // We can't validate functions with JSON Schema
      this.validateBasicStructure(config);
      return;
    }

    if (!this.validateFn(config)) {
      // AJV already provides good error messages
      const errors = this.validateFn.errors!
        .map(err => err.message)
        .join(', ');

      throw VirtualdisplayError.invalidMapping(errors);
    }
  }

  /**
   * Check if configuration contains dynamic values (functions)
   */
  public static containsDynamicValues(config: MappingConfiguration): boolean {
    if (config.attributes === undefined || !Array.isArray(config.attributes)) {
      return false;
    }

    return config.attributes.some(attr => {
      // Check if values is a function
      if (typeof attr.values === 'function') {
        return true;
      }

      // Check if any value properties are functions
      if (Array.isArray(attr.values)) {
        return attr.values.some(val => typeof val.value === 'function' ||
          typeof val.nodeIds === 'function' ||
          typeof val.isSelected === 'function');
      }

      return false;
    });
  }

  /**
   * Basic structure validation for dynamic mappings
   */
  private static validateBasicStructure(config: MappingConfiguration): void {
    if (config.attributes === undefined || !Array.isArray(config.attributes)) {
      throw VirtualdisplayError.invalidMapping('attributes must be an array');
    }

    if (config.attributes.length === 0) {
      throw VirtualdisplayError.invalidMapping('attributes array must not be empty');
    }

    config.attributes.forEach((attr, index) => {
      if (attr.name === undefined || attr.name === '' || typeof attr.name !== 'string') {
        throw VirtualdisplayError.invalidMapping(`attribute at index ${index} must have a name`);
      }

      if (attr.values === undefined) {
        throw VirtualdisplayError.invalidMapping(`attribute '${attr.name}' must have values`);
      }
    });
  }
}
