import { setupConfiguratorForm } from './dom';
import { buildState, buildSingleAttributeState, AttributeType } from './state';
import { createVirtualDisplayClient } from './client';

// Initialize dropdowns and client
const selects = setupConfiguratorForm();
const vdClient = createVirtualDisplayClient();

// construct the initial state from the dropdown values
const initialState = buildState({
  top: selects.top.value,
  topVariant: selects.topVariant.value,
  leg: selects.leg.value,
  legVariant: selects.legVariant.value,
});

console.log(`Sent initial state`, initialState);
vdClient.sendClientState(initialState);

// Maps select names to attribute types
const selectTypeMap: Record<string, AttributeType> = {
  top: 'shape',
  topVariant: 'material',
  leg: 'leg',
  legVariant: 'legmat',
};

// Send only the changed attribute on change event
Object.entries(selects).forEach(([key, select]) =>
  select.addEventListener('change', () => {
    const type = selectTypeMap[key];
    const state = buildSingleAttributeState(type, select.value);
    console.log(`Sent single attribute`, state);
    vdClient.sendClientState(state);
  })
);
