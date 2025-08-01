import { describe, expect, it, beforeEach } from 'vitest';

import { AttributeService } from '../../../src/attributes/attribute-service';
import type { MappingConfiguration, MappingContext } from '../../../src/attributes/mapping-types';
import { EventBus } from '../../../src/events/event-bus';

describe('AttributeService - Dynamic mapping context', () => {
  let attributeService: AttributeService = null as unknown as AttributeService;
  let eventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
  });

  it('should have empty context during initial evaluation - preventing attribute dependencies', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Color',
          values: [
            { value: 'Red', nodeIds: ['color-red'], isSelected: true },
            { value: 'Blue', nodeIds: ['color-blue'] },
          ],
        },
        {
          name: 'Size',
          values: (context: MappingContext) => {
            // This documents an important limitation:
            // You cannot read other attributes during initial mapping load
            const color = context.getValue('Color');
            expect(color).toBeUndefined();

            // Real world scenario: conditional sizing based on color would fail
            // This forces developers to handle this case properly
            return [
              { value: 'Default', nodeIds: ['size-default'], isSelected: true },
            ];
          },
        },
      ],
    };

    attributeService.loadMapping(mapping);

    const sizeAttr = attributeService.getAttribute('Size');
    expect(sizeAttr?.getCurrentValue()?.value).toBe('Default');
  });

  it('should re-evaluate dynamic mappings when selections change - enables dependencies', () => {
    let evaluationCount = 0;

    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'DynamicOptions',
          values: (): Array<{ value: string; nodeIds: string[]; isSelected?: boolean }> => {
            evaluationCount++;
            // Dynamic mappings re-evaluate to handle dependencies
            return [
              { value: 'Option1', nodeIds: ['opt-1'], isSelected: true },
              { value: 'Option2', nodeIds: ['opt-2'] },
            ];
          },
        },
      ],
    };

    attributeService.loadMapping(mapping);
    expect(evaluationCount).toBe(1);

    // Each selection triggers re-evaluation for dynamic mappings
    attributeService.selectAttributeValue('DynamicOptions', 'Option2');
    expect(evaluationCount).toBe(2);

    attributeService.selectAttributeValue('DynamicOptions', 'Option1');
    expect(evaluationCount).toBe(3);

    attributeService.selectAttributeValue('DynamicOptions', 'Option2');
    expect(evaluationCount).toBe(4);
  });
});
