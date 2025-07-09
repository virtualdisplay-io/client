import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import { VirtualdisplayClient, MESSAGE_TYPES, type StateMessage } from '../../../src';

describe('StateService initial sync - add nodes', () => {
  let parent: HTMLDivElement = document.createElement('div');
  let client: VirtualdisplayClient | null = null;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(() => {
    if (client !== null) {
      client.destroy();
      client = null;
    }
    document.body.removeChild(parent);
  });

  const createStateMessage = (
    nodes: Array<{id: string; visible: boolean}>,
    isInitial = false,
  ): StateMessage => ({
    type: MESSAGE_TYPES.STATE,
    nodes: nodes.map(node => ({
      id: node.id,
      name: `Node ${node.id}`,
      type: 'mesh',
      visible: node.visible,
    })),
    isInitial,
  });

  it('should add new nodes from initial state', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    // Send mutation response first
    window.postMessage(createStateMessage([
      { id: 'node1', visible: true },
    ], false), '*');

    await vi.waitFor(() => {
      expect(client?.getNode('node1')).toBeDefined();
    });

    // Initial state includes additional nodes
    window.postMessage(createStateMessage([
      { id: 'node1', visible: false }, // Different visibility - should be ignored
      { id: 'node2', visible: true }, // New node - should be added
      { id: 'node3', visible: false }, // New node - should be added
    ], true), '*');

    await vi.waitFor(() => {
      expect(client?.isReady).toBe(true);
    });

    const node1 = client.getNode('node1');
    const node2 = client.getNode('node2');
    const node3 = client.getNode('node3');

    expect(node1?.isVisible).toBe(true); // Preserved from before
    expect(node2?.isVisible).toBe(true); // Added from initial
    expect(node3?.isVisible).toBe(false); // Added from initial
  });
});
