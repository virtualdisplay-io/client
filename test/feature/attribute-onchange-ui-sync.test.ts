import { describe, expect, it, beforeEach } from 'vitest';

import { EVENT_NAMES, type MappingConfiguration } from '../../src';
import { AttributeService } from '../../src/attributes/attribute-service';
import { EventBus } from '../../src/events/event-bus';
import { createTestNodes } from '../helpers/node-test-helpers';

describe('Feature: onChange - UI sync', () => {
  let attributeService: AttributeService = null as unknown as AttributeService;
  let eventBus: EventBus = null as unknown as EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    attributeService = new AttributeService(eventBus);
  });

  it('should support live UI updates via onChange', () => {
    const mapping: MappingConfiguration = {
      attributes: [
        {
          name: 'Color',
          values: [
            { value: 'Red', nodeIds: ['color-red'], isSelected: false },
            { value: 'Blue', nodeIds: ['color-blue'], isSelected: true },
            { value: 'Green', nodeIds: ['color-green'], isSelected: false },
          ],
        },
      ],
    };

    attributeService.loadMapping(mapping);

    // UI state tracker
    const uiState = {
      buttons: {
        Red: { highlighted: false },
        Blue: { highlighted: true },
        Green: { highlighted: false },
      },
    };

    // Setup onChange to update UI state
    const colorAttr = attributeService.getAttribute('Color');

    colorAttr?.getValue('Red')?.setOnChange(() => {
      uiState.buttons.Red.highlighted = colorAttr.getValue('Red')?.isSelected ?? false;
    });

    colorAttr?.getValue('Blue')?.setOnChange(() => {
      uiState.buttons.Blue.highlighted = colorAttr.getValue('Blue')?.isSelected ?? false;
    });

    colorAttr?.getValue('Green')?.setOnChange(() => {
      uiState.buttons.Green.highlighted = colorAttr.getValue('Green')?.isSelected ?? false;
    });

    // External state change - user clicks Green in 3D viewer
    const nodes = createTestNodes([
      { id: 'color-red', name: 'Red', isVisible: false },
      { id: 'color-blue', name: 'Blue', isVisible: false },
      { id: 'color-green', name: 'Green', isVisible: true },
    ]);

    eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });

    // UI state should update automatically
    expect(uiState.buttons.Red.highlighted).toBe(false);
    expect(uiState.buttons.Blue.highlighted).toBe(false);
    expect(uiState.buttons.Green.highlighted).toBe(true);
  });
});
