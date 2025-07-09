import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import { VirtualdisplayClient, MESSAGE_TYPES, type StateMessage } from '../../../src';

describe('VirtualdisplayClient onReady', () => {
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

  const createStateMessage = (nodeId: string, isInitial = true): StateMessage => ({
    type: MESSAGE_TYPES.STATE,
    nodes: [{
      id: nodeId,
      name: `Node ${nodeId}`,
      type: 'mesh',
      visible: true,
    }],
    isInitial,
  });

  it('should call callback when initial state is received', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    const callback = vi.fn();
    client.onReady(callback);

    expect(callback).not.toHaveBeenCalled();
    expect(client?.isReady).toBe(false);

    window.postMessage(createStateMessage('node1'), '*');

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledOnce();
    });

    expect(client?.isReady).toBe(true);
  });

  it('should call callback immediately if already ready', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    window.postMessage(createStateMessage('node1'), '*');

    await vi.waitFor(() => {
      expect(client?.isReady).toBe(true);
    });

    const callback = vi.fn();
    client.onReady(callback);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should only emit INITIAL_STATE_RECEIVED event once', async () => {
    client = new VirtualdisplayClient({
      parent,
      model: 'test-model.glb',
      license: 'test-license',
    });

    const callback = vi.fn();
    client.onReady(callback);

    window.postMessage(createStateMessage('node1'), '*');

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledOnce();
    });

    window.postMessage(createStateMessage('node2'), '*');

    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });

    expect(callback).toHaveBeenCalledOnce();
  });
});
