import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import { VirtualdisplayClient, MESSAGE_TYPES, type StateMessage } from '../../../src';

describe('StateService initial sync - preserve mutations', () => {
  let parent: HTMLDivElement = document.createElement('div');
  let client: VirtualdisplayClient | null = null;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    vi.clearAllMocks();
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

  it('should preserve existing node visibility during initial sync', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    // Configure mapping which sends mutations
    client.setMapping({
      attributes: [
        {
          name: 'Color',
          values: [
            { value: 'Red', nodeIds: ['node1'], isSelected: true },
            { value: 'Blue', nodeIds: ['node2'], isSelected: false },
          ],
        },
      ],
    });

    // Wait a moment for mutations to be sent
    await new Promise<void>(resolve => { setTimeout(resolve, 50); });

    // Server responds to mutation with state update (not initial)
    window.postMessage(createStateMessage([
      { id: 'node1', visible: true },
      { id: 'node2', visible: false },
    ], false), '*');

    await vi.waitFor(() => {
      const node1 = client?.getNode('node1');
      const node2 = client?.getNode('node2');
      expect(node1?.isVisible).toBe(true);
      expect(node2?.isVisible).toBe(false);
    });

    // Now server sends initial state with all nodes visible
    window.postMessage(createStateMessage([
      { id: 'node1', visible: true },
      { id: 'node2', visible: true },
      { id: 'node3', visible: true },
    ], true), '*');

    await vi.waitFor(() => {
      expect(client?.isReady).toBe(true);
    });

    // Existing nodes should preserve their state from mutations
    const node1 = client.getNode('node1');
    const node2 = client.getNode('node2');
    const node3 = client.getNode('node3');

    expect(node1?.isVisible).toBe(true); // Was already true
    expect(node2?.isVisible).toBe(false); // Should stay false (preserved)
    expect(node3?.isVisible).toBe(true); // New node from initial state
  });
});
