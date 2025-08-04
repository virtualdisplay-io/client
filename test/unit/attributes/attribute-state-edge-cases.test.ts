import { describe, expect, it, beforeEach } from 'vitest';

import { type MappingConfiguration, EVENT_NAMES } from '../../../src';
import { AttributeService } from '../../../src/attributes/attribute-service';
import { EventBus } from '../../../src/events/event-bus';
import { createTestNodes } from '../../helpers/node-test-helpers';

describe('AttributeService - State sync edge cases', () => {
  let attributeService: AttributeService = null as unknown as AttributeService;
  let eventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
  });

  it('should gracefully handle nodes not in mapping - prevents crashes with dynamic 3D models', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Known',
          values: [
            { value: 'A', nodeIds: ['known-a'], isSelected: true },
            { value: 'B', nodeIds: ['known-b'], isSelected: false },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    // Real scenario: 3D model has extra nodes not in the mapping
    // This happens when models are updated but mapping isn't
    const nodes = createTestNodes([
      { id: 'known-a', name: 'A', isVisible: false },
      { id: 'known-b', name: 'B', isVisible: true },
      { id: 'unknown-1', name: 'Unknown1', isVisible: true },
      { id: 'unknown-2', name: 'Unknown2', isVisible: false },
      { id: 'new-feature-node', name: 'NewFeature', isVisible: true },
    ]);

    // Should not throw even with unknown nodes
    expect(() => {
      eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });
    }).not.toThrow();

    // Known attributes should still sync correctly
    const knownAttr = attributeService.getAttribute('Known');
    expect(knownAttr?.getValue('A')?.isSelected).toBe(false);
    expect(knownAttr?.getValue('B')?.isSelected).toBe(true);
  });
});
