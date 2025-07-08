import { describe, expect, it, beforeEach } from 'vitest';

import { createMockSetup, simulateStateChange, type TestSetup } from './shared-test-setup';
import type { MappingConfiguration } from '../../src';

const ecommerceMapping: MappingConfiguration = {
  attributes: [
    {
      name: 'Color',
      values: [
        { value: 'Red', nodeIds: ['color-red'], isSelected: false },
        { value: 'Blue', nodeIds: ['color-blue'], isSelected: true },
        { value: 'Green', nodeIds: ['color-green'], isSelected: false },
      ],
    },
    {
      name: 'Size',
      values: [
        { value: 'Small', nodeIds: ['size-small'], isSelected: true },
        { value: 'Medium', nodeIds: ['size-medium'], isSelected: false },
        { value: 'Large', nodeIds: ['size-large'], isSelected: false },
      ],
    },
    {
      name: 'Material',
      values: [
        { value: 'Leather', nodeIds: ['mat-leather'], isSelected: true },
        { value: 'Canvas', nodeIds: ['mat-canvas'], isSelected: false },
        { value: 'Mesh', nodeIds: ['mat-mesh'], isSelected: false },
      ],
    },
  ],
};

const allNodes = [
  'color-red', 'color-blue', 'color-green',
  'size-small', 'size-medium', 'size-large',
  'mat-leather', 'mat-canvas', 'mat-mesh',
];

describe('Feature: E-commerce basic configuration', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(ecommerceMapping);
  });

  it('should start with default configuration', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    expect(setup.client.getAttribute('Color').getValue('Blue')?.isSelected).toBe(true);
    expect(setup.client.getAttribute('Size').getValue('Small')?.isSelected).toBe(true);
    expect(setup.client.getAttribute('Material').getValue('Leather')?.isSelected).toBe(true);
  });

  it('should provide all available options', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    expect(setup.client.getAttribute('Color').availableValues).toEqual(['Red', 'Blue', 'Green']);
    expect(setup.client.getAttribute('Size').availableValues).toEqual(['Small', 'Medium', 'Large']);
    expect(setup.client.getAttribute('Material').availableValues).toEqual(['Leather', 'Canvas', 'Mesh']);
  });

  it('should change color and send mutations', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    setup.postMessageSpy.mockClear();
    setup.client.getAttribute('Color').select('Red');

    expect(setup.postMessageSpy).toHaveBeenCalledTimes(1);
    const { calls } = setup.postMessageSpy.mock;
    expect(calls[0]?.[0]?.type).toBe('mutation');
    expect(calls[0]?.[0]?.mutations).toEqual([
      { type: 'hide', nodeId: 'color-blue' },
      { type: 'show', nodeId: 'color-red' },
    ]);
  });

  it('should change size and send mutations', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    setup.postMessageSpy.mockClear();
    setup.client.getAttribute('Size').select('Large');

    expect(setup.postMessageSpy).toHaveBeenCalledTimes(1);
    const { calls } = setup.postMessageSpy.mock;
    expect(calls[0]?.[0]?.mutations).toEqual([
      { type: 'hide', nodeId: 'size-small' },
      { type: 'show', nodeId: 'size-large' },
    ]);
  });
});

describe('Feature: E-commerce advanced workflows', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(ecommerceMapping);
  });

  it('should change material and send mutations', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    setup.postMessageSpy.mockClear();
    setup.client.getAttribute('Material').select('Canvas');

    expect(setup.postMessageSpy).toHaveBeenCalledTimes(1);
    const { calls } = setup.postMessageSpy.mock;
    expect(calls[0]?.[0]?.mutations).toEqual([
      { type: 'hide', nodeId: 'mat-leather' },
      { type: 'show', nodeId: 'mat-canvas' },
    ]);
  });

  it('should reject invalid selections', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    const colorAttribute = setup.client.getAttribute('Color');

    expect(() => {
      colorAttribute.select('Purple');
    }).toThrow();

    expect(colorAttribute.getValue('Blue')?.isSelected).toBe(true);
    expect(colorAttribute.getValue('Purple')).toBeUndefined();
  });

  it('should handle multiple sequential changes', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    const colorAttribute = setup.client.getAttribute('Color');

    // Rapid changes
    colorAttribute.select('Red');
    simulateStateChange(setup.clientWithEventBus, ['color-red', 'size-small', 'mat-leather'], allNodes);

    colorAttribute.select('Blue');
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    // Should end up back at blue
    expect(colorAttribute.getValue('Blue')?.isSelected).toBe(true);
    expect(colorAttribute.getValue('Red')?.isSelected).toBe(false);
  });

  it('should maintain attribute independence', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small', 'mat-leather'], allNodes);

    const materialAttribute = setup.client.getAttribute('Material');
    const sizeAttribute = setup.client.getAttribute('Size');

    // Change color - other attributes should remain unchanged
    setup.client.getAttribute('Color').select('Green');
    simulateStateChange(setup.clientWithEventBus, ['color-green', 'size-small', 'mat-leather'], allNodes);

    expect(materialAttribute.getValue('Leather')?.isSelected).toBe(true);
    expect(sizeAttribute.getValue('Small')?.isSelected).toBe(true);
    expect(setup.client.getAttribute('Color').getValue('Green')?.isSelected).toBe(true);
  });
});
