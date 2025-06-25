import { describe, expect, it, beforeEach } from 'vitest';

import { AttributeSelector, type MappingConfiguration } from '../../../src';
import { AttributeService } from '../../../src/attributes/attribute-service';
import { EventBus } from '../../../src/events/event-bus';

describe('AttributeSelector', () => {
  let eventBus = new EventBus();
  let attributeService = new AttributeService(eventBus);
  let selector = new AttributeSelector(attributeService, 'Size');

  const testMapping: MappingConfiguration = {
    attributes: [
      {
        name: 'Size',
        values: [
          { value: 'Small', nodeIds: ['size-small'], isSelected: true },
          { value: 'Large', nodeIds: ['size-large'] },
        ],
      },
    ],
  };

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
    attributeService.loadMapping(testMapping);
    selector = new AttributeSelector(attributeService, 'Size');
  });

  it('should get current value', () => {
    // Default should be selected initially
    expect(selector.currentValue).toBe('Small');
  });

  it('should get available values', () => {
    const values = selector.availableValues;
    expect(values).toEqual(['Small', 'Large']);
  });

  it('should handle non-existent attribute', () => {
    const invalidSelector = new AttributeSelector(attributeService, 'NonExistent');

    expect(invalidSelector.currentValue).toBeUndefined();
    expect(invalidSelector.availableValues).toEqual([]);
  });
});
