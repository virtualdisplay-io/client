import { describe, expect, it } from 'vitest';

import { MUTATION_TYPES } from '../../../src';
import { Attribute } from '../../../src/attributes/attribute';
import { AttributeValue } from '../../../src/attributes/attribute-value';

describe('Attribute - Creation', () => {
  it('should add values to attribute', () => {
    const attribute = new Attribute('Size');
    const small = new AttributeValue('Small', ['size-small']);
    const large = new AttributeValue('Large', ['size-large']);
    const expectedValueCount = 2;

    attribute.addValue(small);
    attribute.addValue(large);

    expect(attribute.getAllValues()).toHaveLength(expectedValueCount);
    expect(attribute.getValue('Small')).toBe(small);
    expect(attribute.getValue('Large')).toBe(large);
  });
});


describe('Attribute - Default Handling', () => {
  it('should get default mutations', () => {
    const attribute = new Attribute('Color');
    const red = new AttributeValue('Red', ['red-1', 'red-2'], true);
    const blue = new AttributeValue('Blue', ['blue-1']);

    attribute.addValue(red);
    attribute.addValue(blue);

    const defaultMutations = attribute.getDefaultMutations();

    expect(defaultMutations).toEqual([
      { type: MUTATION_TYPES.SHOW, nodeId: 'red-1' },
      { type: MUTATION_TYPES.SHOW, nodeId: 'red-2' },
      { type: MUTATION_TYPES.HIDE, nodeId: 'blue-1' },
    ]);
  });
});
