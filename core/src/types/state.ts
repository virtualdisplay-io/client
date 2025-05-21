/**
 * State is used to define the state of a configuration on the client side.
 * It consists of multiple attributes, each containing a set of possible values.
 */
export interface State {
  attributes: Attribute[];
}

/**
 * Represents a single product attribute, like "Color" or "Size", with its possible values.
 */
export interface Attribute {
  name: string;
  values: AttributeValue[];
}

/**
 * Represents a single value of an attribute, like "Red" or "Large", linked to one or more objects.
 */
export interface AttributeValue {
  value: string;
  identifiers: string[];
  isSelected: boolean;
}
