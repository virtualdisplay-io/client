/**
 * Configuration for a single attribute value
 */
export interface AttributeValueConfig {
  readonly value: string;
  readonly nodeIds: string[];
  readonly isSelected?: boolean;
}

/**
 * Configuration for a single attribute
 */
export interface AttributeConfig {
  readonly name: string;
  readonly values: AttributeValueConfig[];
}

/**
 * Complete mapping configuration
 * Defines how product attributes map to 3D nodes
 */
export interface MappingConfiguration {
  readonly attributes: AttributeConfig[];
}
