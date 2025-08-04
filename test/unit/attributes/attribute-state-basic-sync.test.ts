import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, EVENT_NAMES } from '../../../src';
import { AttributeService } from '../../../src/attributes/attribute-service';
import { EventBus } from '../../../src/events/event-bus';
import { createTestNodes } from '../../helpers/node-test-helpers';

describe('AttributeService - Basic state sync', () => {
  let attributeService: AttributeService = null as unknown as AttributeService;
  let eventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
  });

  it('should sync attribute values with node visibility', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Material',
          values: [
            { value: 'Wood', nodeIds: ['mat-wood-1', 'mat-wood-2'], isSelected: true },
            { value: 'Metal', nodeIds: ['mat-metal'], isSelected: false },
            { value: 'Plastic', nodeIds: ['mat-plastic'], isSelected: false },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    // Initial state
    const materialAttr = attributeService.getAttribute('Material');
    expect(materialAttr?.getCurrentValue()?.value).toBe('Wood');

    // Simulate external state change from 3D viewer
    const nodes = createTestNodes([
      { id: 'mat-wood-1', name: 'Wood1', isVisible: false },
      { id: 'mat-wood-2', name: 'Wood2', isVisible: false },
      { id: 'mat-metal', name: 'Metal', isVisible: true },
      { id: 'mat-plastic', name: 'Plastic', isVisible: false },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });

    // Check that values are synced
    const woodValue = materialAttr?.getValue('Wood');
    const metalValue = materialAttr?.getValue('Metal');
    const plasticValue = materialAttr?.getValue('Plastic');

    expect(woodValue?.isSelected).toBe(false);
    expect(metalValue?.isSelected).toBe(true);
    expect(plasticValue?.isSelected).toBe(false);
  });

  it('should handle partial node visibility correctly', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Component',
          values: [
            { value: 'Full', nodeIds: ['comp-1', 'comp-2', 'comp-3'], isSelected: true },
            { value: 'Partial', nodeIds: ['comp-4', 'comp-5'], isSelected: false },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    // Only some nodes of "Full" are visible
    const nodes = createTestNodes([
      { id: 'comp-1', name: 'C1', isVisible: true },
      { id: 'comp-2', name: 'C2', isVisible: false },
      { id: 'comp-3', name: 'C3', isVisible: true },
      { id: 'comp-4', name: 'C4', isVisible: false },
      { id: 'comp-5', name: 'C5', isVisible: false },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });

    const componentAttr = attributeService.getAttribute('Component');
    const fullValue = componentAttr?.getValue('Full');
    const partialValue = componentAttr?.getValue('Partial');

    // Full should not be selected because not all nodes are visible
    expect(fullValue?.isSelected).toBe(false);
    expect(partialValue?.isSelected).toBe(false);
  });
});
