import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import { VirtualdisplayClient, MESSAGE_TYPES, type StateMessage } from '../../../src';

describe('ModelNode onChange - callback management', () => {
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

  it('should handle multiple onChange callbacks on same node', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    // Send initial state
    window.postMessage(createStateMessage([
      { id: 'node1', visible: true },
    ], true), '*');

    await vi.waitFor(() => {
      expect(client?.isReady).toBe(true);
    });

    const node = client.getNode('node1');
    const onChange1 = vi.fn();
    const onChange2 = vi.fn();

    // First set onChange
    node!.onChange = onChange1;

    // Replace with new onChange
    node!.onChange = onChange2;

    // Send update
    window.postMessage(createStateMessage([
      { id: 'node1', visible: false },
    ]), '*');

    await vi.waitFor(() => {
      expect(onChange2).toHaveBeenCalledOnce();
    });

    // First callback should not be called
    expect(onChange1).not.toHaveBeenCalled();
  });

  it('should clear onChange when set to undefined', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    // Send initial state
    window.postMessage(createStateMessage([
      { id: 'node1', visible: true },
    ], true), '*');

    await vi.waitFor(() => {
      expect(client?.isReady).toBe(true);
    });

    const node = client.getNode('node1');
    const onChange = vi.fn();

    node!.onChange = onChange;
    delete node!.onChange;

    // Send update
    window.postMessage(createStateMessage([
      { id: 'node1', visible: false },
    ]), '*');

    await new Promise<void>(resolve => { setTimeout(resolve, 100); });

    expect(onChange).not.toHaveBeenCalled();
  });
});
