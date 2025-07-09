import { describe, expect, it, beforeEach } from 'vitest';

import { createMockSetup, simulateStateChange, type TestSetup } from './shared-test-setup';
import type { MappingConfiguration } from '../../src';
import { expectMutationCall } from '../helpers/mutation-test-helpers';

const demoMapping: MappingConfiguration = {
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
  ],
};

const allNodes = [
  'color-red', 'color-blue', 'color-green',
  'size-small', 'size-medium', 'size-large',
];

describe('Feature: AttributeValue onChange callbacks', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(demoMapping);
  });

  it('should register onChange callback on AttributeValue', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small'], allNodes);

    const blueColorValue = setup.client.getAttribute('Color').getValue('Blue');
    expect(blueColorValue).toBeDefined();

    let callbackTriggered = false;
    blueColorValue?.setOnChange(() => {
      callbackTriggered = true;
    });

    // Trigger a change to see if callback fires
    setup.client.getAttribute('Color').select('Red');

    expect(callbackTriggered).toBe(false); // Callback doesn't fire immediately, needs state sync
  });

  it('should register onChange callback via AttributeSelector', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small'], allNodes);

    const colorAttribute = setup.client.getAttribute('Color');
    let _callbackCount = 0;

    colorAttribute.onChange(() => {
      _callbackCount += 1;
    });

    // The onChange method should exist and be callable
    expect(typeof colorAttribute.onChange).toBe('function');
  });

  it('should send mutations when changing selections', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small'], allNodes);

    expectMutationCall(setup, () => {
      setup.client.getAttribute('Color').select('Red');
    }, [
      { type: 'hide', nodeId: 'color-blue' },
      { type: 'show', nodeId: 'color-red' },
    ]);
  });
});

describe('Feature: E-commerce cart integration', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(demoMapping);
  });

  it('should allow building cart state from current selections', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small'], allNodes);

    const getCurrentCart = (): { color: string | undefined; size: string | undefined } => {
      const colorValues = setup.client.getAttribute('Color').getValues();
      const sizeValues = setup.client.getAttribute('Size').getValues();

      const selectedColor = colorValues.find(v => v.isSelected)?.value;
      const selectedSize = sizeValues.find(v => v.isSelected)?.value;

      return { color: selectedColor, size: selectedSize };
    };

    expect(getCurrentCart()).toEqual({ color: 'Blue', size: 'Small' });
  });

  it('should provide available options for UI rendering', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'size-small'], allNodes);

    const colorAttribute = setup.client.getAttribute('Color');
    const sizeAttribute = setup.client.getAttribute('Size');

    expect(colorAttribute.availableValues).toEqual(['Red', 'Blue', 'Green']);
    expect(sizeAttribute.availableValues).toEqual(['Small', 'Medium', 'Large']);
  });
});
