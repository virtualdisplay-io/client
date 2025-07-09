import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import { VirtualdisplayClient, MESSAGE_TYPES, type StateMessage } from '../../../src';

describe('StateService initial sync - updates', () => {
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

  it('should update nodes normally for non-initial state messages', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    // Send initial state
    window.postMessage(createStateMessage([
      { id: 'node1', visible: true },
      { id: 'node2', visible: false },
    ], true), '*');

    await vi.waitFor(() => {
      expect(client?.isReady).toBe(true);
    });

    // Send non-initial update
    window.postMessage(createStateMessage([
      { id: 'node1', visible: false },
      { id: 'node2', visible: true },
      { id: 'node3', visible: true },
    ], false), '*');

    await vi.waitFor(() => {
      const node3 = client?.getNode('node3');
      expect(node3).toBeDefined();
    });

    // All nodes should be updated/created
    const node1 = client.getNode('node1');
    const node2 = client.getNode('node2');
    const node3 = client.getNode('node3');

    expect(node1?.isVisible).toBe(false);
    expect(node2?.isVisible).toBe(true);
    expect(node3?.isVisible).toBe(true);
  });
});
