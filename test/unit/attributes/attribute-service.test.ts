import { describe, expect, it, beforeEach, vi } from 'vitest';

import { type MappingConfiguration, EVENT_NAMES, NODE_TYPES, ModelNode } from '../../../src';
import { AttributeService } from '../../../src/attributes/attribute-service';
import { EventBus } from '../../../src/events/event-bus';

const testMapping: MappingConfiguration = {
  attributes: [
    {
      name: 'Color',
      values: [
        { value: 'Red', nodeIds: ['red-1', 'red-2'], isSelected: true },
        { value: 'Blue', nodeIds: ['blue-1'] },
      ],
    },
  ],
};

describe('AttributeService - Initialization', () => {
  let eventBus = new EventBus();
  let service = new AttributeService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    service = new AttributeService(eventBus);
  });

  it('should initialize without mapping', () => {
    expect(service.initialized).toBe(false);
    expect(service.getAllAttributes()).toHaveLength(0);
  });

  it('should load mapping and emit default mutations', () => {
    const mutationSpy = vi.fn();
    eventBus.on(EVENT_NAMES.MUTATION_MESSAGE, mutationSpy);

    service.loadMapping(testMapping);

    expect(service.initialized).toBe(true);
    expect(service.getAllAttributes()).toHaveLength(1);
    expect(mutationSpy).toHaveBeenCalledWith({
      message: {
        type: 'mutation',
        mutations: expect.arrayContaining([
          expect.objectContaining({ nodeId: 'red-1' }),
          expect.objectContaining({ nodeId: 'red-2' }),
        ]),
      },
    });
  });
});

describe('AttributeService - Selection', () => {
  let eventBus = new EventBus();
  let service = new AttributeService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    service = new AttributeService(eventBus);
  });

  it('should select attribute value and emit mutations', () => {
    const mutationSpy = vi.fn();
    eventBus.on(EVENT_NAMES.MUTATION_MESSAGE, mutationSpy);

    service.loadMapping(testMapping);
    mutationSpy.mockClear(); // Clear default mutations

    service.selectAttributeValue('Color', 'Blue');

    expect(mutationSpy).toHaveBeenCalledWith({
      message: {
        type: 'mutation',
        mutations: expect.arrayContaining([
          expect.objectContaining({ nodeId: 'red-1', type: 'hide' }),
          expect.objectContaining({ nodeId: 'red-2', type: 'hide' }),
          expect.objectContaining({ nodeId: 'blue-1', type: 'show' }),
        ]),
      },
    });
  });

  it('should handle invalid attribute selection', () => {
    const mutationSpy = vi.fn();
    eventBus.on(EVENT_NAMES.MUTATION_MESSAGE, mutationSpy);

    service.loadMapping(testMapping);
    mutationSpy.mockClear();

    service.selectAttributeValue('NonExistent', 'Red');
    service.selectAttributeValue('Color', 'NonExistent');

    // Should not emit any mutations for invalid selections
    expect(mutationSpy).not.toHaveBeenCalled();
  });
});

describe('AttributeService - State Sync', () => {
  let eventBus = new EventBus();
  let service = new AttributeService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    service = new AttributeService(eventBus);
  });

  it('should have correct initial attribute selection state', () => {
    service.loadMapping(testMapping);

    const colorAttr = service.getAttribute('Color');
    const blueValue = colorAttr?.getValue('Blue');
    const redValue = colorAttr?.getValue('Red');

    // Initially Red should be selected (isDefault: true)
    expect(redValue?.isSelected).toBe(true);
    expect(blueValue?.isSelected).toBe(false);
  });

  it('should sync attributes with state changes', () => {
    service.loadMapping(testMapping);

    const colorAttr = service.getAttribute('Color');
    const blueValue = colorAttr?.getValue('Blue');
    const redValue = colorAttr?.getValue('Red');

    // Emit state change where Blue is visible
    const blueNode = new ModelNode({ id: 'blue-1', name: 'Blue', type: NODE_TYPES.MESH, visible: true });
    const redNode1 = new ModelNode({ id: 'red-1', name: 'Red 1', type: NODE_TYPES.MESH, visible: false });
    const redNode2 = new ModelNode({ id: 'red-2', name: 'Red 2', type: NODE_TYPES.MESH, visible: false });

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, {
      nodes: [blueNode, redNode1, redNode2],
    });

    // After sync, Blue should be selected and Red should not be
    expect(blueValue?.isSelected).toBe(true);
    expect(redValue?.isSelected).toBe(false);
  });
});

describe('AttributeService - Query', () => {
  let eventBus = new EventBus();
  let service = new AttributeService(eventBus);

  beforeEach(() => {
    eventBus = new EventBus();
    service = new AttributeService(eventBus);
  });

  it('should get attribute by name', () => {
    service.loadMapping(testMapping);

    const colorAttr = service.getAttribute('Color');
    const nonExistent = service.getAttribute('NonExistent');

    expect(colorAttr).toBeDefined();
    expect(colorAttr!.name).toBe('Color');
    expect(nonExistent).toBeUndefined();
  });

  it('should clear all attributes', () => {
    service.loadMapping(testMapping);
    expect(service.initialized).toBe(true);

    service.clear();

    expect(service.initialized).toBe(false);
    expect(service.getAllAttributes()).toHaveLength(0);
  });
});
