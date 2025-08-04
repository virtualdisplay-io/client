import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, EVENT_NAMES } from '../../src';
import { AttributeService } from '../../src/attributes/attribute-service';
import { EventBus } from '../../src/events/event-bus';
import { createTestNodes } from '../helpers/node-test-helpers';

describe('Feature: onChange - 3D viewer synchronization', () => {
  let attributeService: AttributeService = null as unknown as AttributeService;
  let eventBus: EventBus = null as unknown as EventBus;
  let changeLog: Array<{ attribute: string; value: string; selected: boolean }> = [];

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
    changeLog = [];

    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Material',
          values: [
            { value: 'Wood', nodeIds: ['mat-wood'], isSelected: true },
            { value: 'Metal', nodeIds: ['mat-metal'] },
            { value: 'Glass', nodeIds: ['mat-glass'] },
          ],
        },
        {
          name: 'Finish',
          values: [
            { value: 'Matte', nodeIds: ['finish-matte'], isSelected: true },
            { value: 'Glossy', nodeIds: ['finish-glossy'] },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    // Register onChange for all values
    const materialAttr = attributeService.getAttribute('Material');
    materialAttr?.getAllValues().forEach(value => {
      value.setOnChange(() => {
        changeLog.push({
          attribute: 'Material',
          value: value.value,
          selected: value.isSelected,
        });
      });
    });

    const finishAttr = attributeService.getAttribute('Finish');
    finishAttr?.getAllValues().forEach(value => {
      value.setOnChange(() => {
        changeLog.push({
          attribute: 'Finish',
          value: value.value,
          selected: value.isSelected,
        });
      });
    });
  });

  it('should not trigger onChange for API selections - prevents infinite loops', () => {
    // API selection should NOT trigger onChange to prevent UI feedback loops
    attributeService.selectAttributeValue('Material', 'Metal');
    expect(changeLog).toHaveLength(0);
  });

  it('should trigger onChange for 3D viewer state changes - enables UI sync', () => {
    // 3D viewer state change (user clicks in 3D viewer)
    const nodes = createTestNodes([
      { id: 'mat-wood', name: 'Wood', isVisible: false },
      { id: 'mat-metal', name: 'Metal', isVisible: false },
      { id: 'mat-glass', name: 'Glass', isVisible: true },
      { id: 'finish-matte', name: 'Matte', isVisible: false },
      { id: 'finish-glossy', name: 'Glossy', isVisible: true },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });

    // Should trigger onChange for all affected values
    expect(changeLog).toHaveLength(5); // All 5 values changed state

    // Verify specific changes
    const woodChange = changeLog.find(c => c.attribute === 'Material' && c.value === 'Wood');
    expect(woodChange?.selected).toBe(false);

    const glassChange = changeLog.find(c => c.attribute === 'Material' && c.value === 'Glass');
    expect(glassChange?.selected).toBe(true);

    const glossyChange = changeLog.find(c => c.attribute === 'Finish' && c.value === 'Glossy');
    expect(glossyChange?.selected).toBe(true);
  });
});
