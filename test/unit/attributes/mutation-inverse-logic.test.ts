import { describe, expect, it } from 'vitest';

import { MUTATION_TYPES } from '../../../src';
import { Attribute } from '../../../src/attributes/attribute';
import { AttributeValue } from '../../../src/attributes/attribute-value';

describe('Mutation Inverse Logic', () => {
  it('should correctly handle attribute selection with inverse', () => {
    // Setup attribute with two values
    const attribute = new Attribute('Color');
    const redValue = new AttributeValue('Red', ['mat_red'], false); // Not selected (hidden)
    const blueValue = new AttributeValue('Blue', ['mat_blue'], false); // Not selected (hidden)

    attribute.addValue(redValue);
    attribute.addValue(blueValue);

    // Select red (from nothing selected to red)
    const mutations = attribute.select('Red');

    // We expect:
    // - Red nodes to be shown (red is hidden, getMutations returns hide, inverse shows)
    // - Blue nodes to be hidden (blue is hidden, getMutations returns hide, inverse shows)
    // Wait, this doesn't make sense...

    // Let me trace through the actual logic:
    // 1. redValue.selected = false
    // 2. redValue.getMutations() returns hide mutations (because selected = false)
    // 3. In determineMutationsForSelection, newValue.getMutations().inverse() converts hide to show
    // 4. No currentValue, so we just return the show mutations for red

    expect(mutations).toHaveLength(1);
    expect(mutations[0]?.type).toBe(MUTATION_TYPES.SHOW);
    expect(mutations[0]?.nodeId).toBe('mat_red');
  });

  it('should correctly switch between values', () => {
    // Setup attribute with two values
    const attribute = new Attribute('Color');
    const redValue = new AttributeValue('Red', ['mat_red'], true); // Selected (visible)
    const blueValue = new AttributeValue('Blue', ['mat_blue'], false); // Not selected (hidden)

    attribute.addValue(redValue);
    attribute.addValue(blueValue);

    // Now red is selected, let's trace what happens
    // redValue.selected = true, so getMutations() returns show mutations
    // blueValue.selected = false, so getMutations() returns hide mutations

    // Select blue (switch from red to blue)
    const mutations = attribute.select('Blue');

    // Expected flow:
    // 1. currentValue = redValue (selected = true)
    // 2. currentValue.getMutations() returns show mutations
    // 3. inverse() converts show to hide mutations for red
    // 4. newValue = blueValue (selected = false)
    // 5. newValue.getMutations() returns hide mutations
    // 6. inverse() converts hide to show mutations for blue

    // So we expect: hide red, show blue
    expect(mutations).toEqual([
      { type: MUTATION_TYPES.HIDE, nodeId: 'mat_red' },
      { type: MUTATION_TYPES.SHOW, nodeId: 'mat_blue' },
    ]);
  });

  it('should handle multiple nodes per value', () => {
    const attribute = new Attribute('Size');
    const largeValue = new AttributeValue('Large', ['scale_x_large', 'scale_y_large'], true); // Selected
    const smallValue = new AttributeValue('Small', ['scale_x_small', 'scale_y_small'], false); // Not selected

    attribute.addValue(largeValue);
    attribute.addValue(smallValue);

    // Switch from large to small
    const mutations = attribute.select('Small');

    // Expected: hide 2 large nodes, show 2 small nodes
    expect(mutations).toEqual([
      { type: MUTATION_TYPES.HIDE, nodeId: 'scale_x_large' },
      { type: MUTATION_TYPES.HIDE, nodeId: 'scale_y_large' },
      { type: MUTATION_TYPES.SHOW, nodeId: 'scale_x_small' },
      { type: MUTATION_TYPES.SHOW, nodeId: 'scale_y_small' },
    ]);
  });
});
