import type { State, Attribute } from '@virtualdisplay-io/client';
import { tops, topVariants, legs, legVariants } from './config';

export type AttributeType = 'shape' | 'material' | 'leg' | 'legmat';

/**
 * Returns an Attribute for the given type and selected value.
 */
export const buildAttribute = (
  type: AttributeType,
  selected: string
): Attribute => {
  switch (type) {
    case 'shape':
      return {
        name: 'shape',
        values: tops.map(({ id, name }) => ({
          value: name,
          identifiers: [id],
          isSelected: id === selected,
        })),
      };
    case 'material':
      return {
        name: 'material',
        values: topVariants.map((variant) => ({
          value: variant,
          identifiers: [variant],
          isSelected: variant === selected,
        })),
      };
    case 'leg':
      return {
        name: 'leg',
        values: legs.map(({ id, name }) => ({
          value: name,
          identifiers: [id],
          isSelected: id === selected,
        })),
      };
    case 'legmat':
      return {
        name: 'legmat',
        values: legVariants.map((variant) => ({
          value: variant,
          identifiers: [variant],
          isSelected: variant === selected,
        })),
      };
    default:
      throw new Error(`Unknown attribute type: ${type}`);
  }
};

/**
 * Builds a complete State from all dropdowns/selects.
 */
export const buildState = (selected: {
  top: string;
  topVariant: string;
  leg: string;
  legVariant: string;
}): State => ({
  attributes: [
    buildAttribute('shape', selected.top),
    buildAttribute('material', selected.topVariant),
    buildAttribute('leg', selected.leg),
    buildAttribute('legmat', selected.legVariant),
  ],
});

/**
 * Builds a state for only a single attribute change (for fast UX).
 */
export const buildSingleAttributeState = (
  type: AttributeType,
  selected: string
): State => ({
  attributes: [buildAttribute(type, selected)],
});
