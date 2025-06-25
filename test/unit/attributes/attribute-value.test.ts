import { describe, expect, it } from 'vitest';

import { MUTATION_TYPES } from '../../../src';
import { AttributeValue } from '../../../src/attributes/attribute-value';

describe('AttributeValue - Creation', () => {
  it('should create default attribute value', () => {
    const value = new AttributeValue('Blue', ['node3'], true);

    expect(value.value).toBe('Blue');
    expect(value.isSelected).toBe(true); // Defaults start selected
  });
});

describe('AttributeValue - Mutations', () => {
  it('should generate mutations based on selection state', () => {
    const value = new AttributeValue('Green', ['node1', 'node2']);

    // When not selected, should generate hide mutations
    const hideMutations = value.getMutations();
    expect(hideMutations).toEqual([
      { type: MUTATION_TYPES.HIDE, nodeId: 'node1' },
      { type: MUTATION_TYPES.HIDE, nodeId: 'node2' },
    ]);

    // When selected, should generate show mutations
    value.setSelected(true);
    const showMutations = value.getMutations();
    expect(showMutations).toEqual([
      { type: MUTATION_TYPES.SHOW, nodeId: 'node1' },
      { type: MUTATION_TYPES.SHOW, nodeId: 'node2' },
    ]);
  });
});

describe('AttributeValue - State Management', () => {
  it('should update selection state', () => {
    const value = new AttributeValue('Purple', ['node1']);

    expect(value.isSelected).toBe(false);

    value.setSelected(true);
    expect(value.isSelected).toBe(true);

    value.setSelected(false);
    expect(value.isSelected).toBe(false);
  });

  it('should check if value has specific node', () => {
    const value = new AttributeValue('Orange', ['node1', 'node2', 'node3']);

    expect(value.hasNode('node1')).toBe(true);
    expect(value.hasNode('node2')).toBe(true);
    expect(value.hasNode('node4')).toBe(false);
  });

  it('should return defensive copies of node list', () => {
    const originalNodes = ['node1', 'node2'];
    const value = new AttributeValue('Test', originalNodes);

    const nodeList1 = value.nodeList;
    const nodeList2 = value.nodeList;

    // Should return same content
    expect(nodeList1).toEqual(['node1', 'node2']);
    expect(nodeList2).toEqual(['node1', 'node2']);
  });
});
