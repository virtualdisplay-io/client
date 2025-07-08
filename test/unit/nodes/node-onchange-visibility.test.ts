import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import { VirtualdisplayClient } from '../../../src/client/virtualdisplay-client';
import { MESSAGE_TYPES, type StateMessage } from '../../../src/messaging/message-types';

describe('ModelNode onChange - visibility changes', () => {
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

  it('should trigger onChange when node visibility changes', async () => {
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

    const node1 = client.getNode('node1');
    const node2 = client.getNode('node2');

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();

    const onChange1 = vi.fn();
    const onChange2 = vi.fn();

    node1!.onChange = onChange1;
    node2!.onChange = onChange2;

    // Send update that changes visibility
    window.postMessage(createStateMessage([
      { id: 'node1', visible: false },
      { id: 'node2', visible: true },
    ]), '*');

    await vi.waitFor(() => {
      expect(onChange1).toHaveBeenCalledOnce();
      expect(onChange2).toHaveBeenCalledOnce();
    });

    expect(node1!.isVisible).toBe(false);
    expect(node2!.isVisible).toBe(true);
  });
});
