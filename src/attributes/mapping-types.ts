/**
 * Context provided to dynamic value functions
 */
export interface MappingContext {
  getValue: (attributeName: string) => string | undefined;
  getAllValues: () => Map<string, string>;
}

/**
 * A value that can be static or dynamically computed
 */
export type DynamicValue<T> = T | ((context: MappingContext) => T);

/**
 * Configuration for a single attribute value
 * All properties can be static or dynamic
 */
export interface AttributeValueConfig {
  readonly value: DynamicValue<string>;
  readonly nodeIds: DynamicValue<string[]>;
  readonly isSelected?: DynamicValue<boolean>;
}

/**
 * Configuration for a single attribute
 */
export interface AttributeConfig {
  readonly name: string;
  readonly values: DynamicValue<AttributeValueConfig[]>;
}

/**
 * Complete mapping configuration
 * Defines how product attributes map to 3D nodes
 */
export interface MappingConfiguration {
  readonly attributes: AttributeConfig[];
}
