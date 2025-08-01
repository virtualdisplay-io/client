import { describe, expect, it, beforeEach, vi } from 'vitest';

import { type MappingConfiguration, EVENT_NAMES } from '../../src';
import { AttributeService } from '../../src/attributes/attribute-service';
import { EventBus } from '../../src/events/event-bus';
import { createTestNodes } from '../helpers/node-test-helpers';

describe('Feature: onChange - Edge cases', () => {
  let attributeService: AttributeService = null as unknown as AttributeService;
  let eventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
  });

  it('should trigger onChange even when external state matches current', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Status',
          values: [
            { value: 'On', nodeIds: ['status-on'], isSelected: true },
            { value: 'Off', nodeIds: ['status-off'], isSelected: false },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    const onChange = vi.fn();
    const statusAttr = attributeService.getAttribute('Status');
    statusAttr?.getValue('On')?.setOnChange(onChange);
    statusAttr?.getValue('Off')?.setOnChange(onChange);

    // External state same as current
    const nodes = createTestNodes([
      { id: 'status-on', name: 'On', isVisible: true },
      { id: 'status-off', name: 'Off', isVisible: false },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });

    // Should still trigger because syncStateWithAttributes always calls setSelected
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('should handle onChange added after initialization', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Mode',
          values: [
            { value: 'Auto', nodeIds: ['mode-auto'], isSelected: true },
            { value: 'Manual', nodeIds: ['mode-manual'] },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    // First state change without onChange
    const nodes1 = createTestNodes([
      { id: 'mode-auto', name: 'Auto', isVisible: false },
      { id: 'mode-manual', name: 'Manual', isVisible: true },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes: nodes1 });

    // Add onChange after state change
    const onChange = vi.fn();
    const modeAttr = attributeService.getAttribute('Mode');
    modeAttr?.getValue('Manual')?.setOnChange(onChange);

    // Second state change
    const nodes2 = createTestNodes([
      { id: 'mode-auto', name: 'Auto', isVisible: true },
      { id: 'mode-manual', name: 'Manual', isVisible: false },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes: nodes2 });

    // Should trigger for the second change
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
