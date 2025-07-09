import { describe, expect, it, beforeEach } from 'vitest';

import { createMockSetup, simulateStateChange, type TestSetup } from './shared-test-setup';
import type { MappingConfiguration, VirtualdisplayClient } from '../../src';
import { expectMutationCall } from '../helpers/mutation-test-helpers';

const productMapping: MappingConfiguration = {
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
      name: 'Finish',
      values: [
        { value: 'Matte', nodeIds: ['finish-matte'], isSelected: true },
        { value: 'Glossy', nodeIds: ['finish-glossy'], isSelected: false },
      ],
    },
  ],
};

const allNodes = [
  'color-red', 'color-blue', 'color-green',
  'finish-matte', 'finish-glossy',
];

interface AttributeChangeTest {
  attributeName: string;
  value: string;
  expectedMutations: ReadonlyArray<{ type: string; nodeId: string }>;
}

function testAttributeChange(
  testSetup: TestSetup,
  test: AttributeChangeTest,
): void {
  testSetup.postMessageSpy.mockClear();
  testSetup.client.getAttribute(test.attributeName).select(test.value);
  expect(testSetup.postMessageSpy).toHaveBeenCalledTimes(1);
  const { calls } = testSetup.postMessageSpy.mock;
  expect(calls[0]?.[0]?.mutations).toEqual(test.expectedMutations);
}

function getColorNodes(testSetup: TestSetup): { redNode: NonNullable<ReturnType<VirtualdisplayClient['getNode']>>; blueNode: NonNullable<ReturnType<VirtualdisplayClient['getNode']>> } {
  const redNode = testSetup.client.getNode('color-red');
  const blueNode = testSetup.client.getNode('color-blue');

  expect(redNode).toBeDefined();
  expect(blueNode).toBeDefined();

  if (redNode === undefined || blueNode === undefined) {
    throw new Error('Nodes should exist after state change');
  }

  return { redNode, blueNode };
}

describe('Feature: AttributeValue basic functionality', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(productMapping);
  });

  it('should track current selection state', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    const colorAttribute = setup.client.getAttribute('Color');
    const redColorValue = colorAttribute.getValue('Red');
    const blueColorValue = colorAttribute.getValue('Blue');

    expect(redColorValue?.isSelected).toBe(false);
    expect(blueColorValue?.isSelected).toBe(true);
  });

  it('should provide stable object references', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    const blueValueRef1 = setup.client.getAttribute('Color').getValue('Blue')!;
    const blueValueRef2 = setup.client.getAttribute('Color').getValue('Blue')!;

    expect(blueValueRef1).toBe(blueValueRef2);
    expect(blueValueRef1.value).toBe('Blue');
    expect(blueValueRef1.nodeList).toEqual(['color-blue']);
  });

  it('should send mutations when selecting different values', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    expectMutationCall(setup, () => {
      setup.client.getAttribute('Color').select('Red');
    }, [
      { type: 'hide', nodeId: 'color-blue' },
      { type: 'show', nodeId: 'color-red' },
    ]);
  });
});

describe('Feature: Live property updates', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(productMapping);
  });

  it('should update AttributeValue.isSelected live when state changes', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    const redColorValue = setup.client.getAttribute('Color').getValue('Red')!;
    const blueColorValue = setup.client.getAttribute('Color').getValue('Blue')!;

    expect(redColorValue.isSelected).toBe(false);
    expect(blueColorValue.isSelected).toBe(true);

    simulateStateChange(setup.clientWithEventBus, ['color-red', 'finish-matte'], allNodes);

    expect(redColorValue.isSelected).toBe(true);
    expect(blueColorValue.isSelected).toBe(false);
  });

  it('should update ModelNode.isVisible live when state changes', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    const { redNode, blueNode } = getColorNodes(setup);

    expect(redNode.isVisible).toBe(false);
    expect(blueNode.isVisible).toBe(true);

    simulateStateChange(setup.clientWithEventBus, ['color-red', 'finish-matte'], allNodes);

    expect(redNode.isVisible).toBe(true);
    expect(blueNode.isVisible).toBe(false);
  });
});

describe('Feature: Multi-attribute configuration', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(productMapping);
  });

  it('should handle independent attribute changes', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    testAttributeChange(setup, {
      attributeName: 'Color',
      value: 'Red',
      expectedMutations: [
        { type: 'hide', nodeId: 'color-blue' },
        { type: 'show', nodeId: 'color-red' },
      ],
    });

    testAttributeChange(setup, {
      attributeName: 'Finish',
      value: 'Glossy',
      expectedMutations: [
        { type: 'hide', nodeId: 'finish-matte' },
        { type: 'show', nodeId: 'finish-glossy' },
      ],
    });
  });

  it('should allow reading current configuration state', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    const getCurrentConfig = (): { color: string | undefined; finish: string | undefined } => {
      const colorValues = setup.client.getAttribute('Color').getValues();
      const finishValues = setup.client.getAttribute('Finish').getValues();

      return {
        color: colorValues.find(v => v.isSelected)?.value,
        finish: finishValues.find(v => v.isSelected)?.value,
      };
    };

    expect(getCurrentConfig()).toEqual({ color: 'Blue', finish: 'Matte' });
  });
});

describe('Feature: Complete workflow integration', () => {
  let setup = {} as TestSetup;

  beforeEach(() => {
    setup = createMockSetup(productMapping);
  });

  it('should demonstrate complete select-to-live-update flow', () => {
    simulateStateChange(setup.clientWithEventBus, ['color-blue', 'finish-matte'], allNodes);

    const redColorValue = setup.client.getAttribute('Color').getValue('Red')!;
    const blueColorValue = setup.client.getAttribute('Color').getValue('Blue')!;
    const redNode = setup.client.getNode('color-red');
    const blueNode = setup.client.getNode('color-blue');

    setup.client.getAttribute('Color').select('Red');
    simulateStateChange(setup.clientWithEventBus, ['color-red', 'finish-matte'], allNodes);

    assertLiveUpdatesWorking({
      redColorValue,
      blueColorValue,
      redNode: redNode!,
      blueNode: blueNode!,
    });
  });

  function assertLiveUpdatesWorking(values: {
    redColorValue: { isSelected: boolean };
    blueColorValue: { isSelected: boolean };
    redNode: { isVisible: boolean };
    blueNode: { isVisible: boolean };
  }): void {
    expect(values.redColorValue.isSelected).toBe(true);
    expect(values.blueColorValue.isSelected).toBe(false);
    expect(values.redNode.isVisible).toBe(true);
    expect(values.blueNode.isVisible).toBe(false);
  }
});
