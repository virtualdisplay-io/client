import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient, VirtualDisplayRequestType } from '../../src';
import { State } from '../../src';
import { VirtualDisplayResponse } from '../../src';
import { responseDispatcher } from '../../src';

describe('VirtualDisplayClient', () => {
  // @ts-ignore
  let requestQueueMock: vi.Mock;
  let client: VirtualDisplayClient;

  beforeEach((): void => {
    requestQueueMock = vi.fn();

    const mockQueue = {
      send: requestQueueMock,
      flush: vi.fn(),
      isReady: true,
    };

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
      value: {
        postMessage: requestQueueMock,
      },
      writable: true,
    });
    iframe.id = 'virtual-display';

    document.body.appendChild(iframe);

    client = new VirtualDisplayClient(iframe);
    // @ts-ignore
    client.queue = mockQueue;
  });

  afterEach((): void => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should ignore unknown message types', (): void => {
    const unknownMessage = { type: 'UNKNOWN_EVENT', context: null };
    window.postMessage(unknownMessage, '*');

    expect(requestQueueMock).not.toHaveBeenCalled();
  });

  it('should not throw an error if state attributes are empty', (): void => {
    const state: State = { attributes: [] };

    expect(() => client.sendClientState(state)).not.toThrow();
  });

  it('should handle null model tree gracefully', async (): Promise<void> => {
    responseDispatcher.once = vi.fn().mockResolvedValue(null);
    const result: VirtualDisplayResponse = await client.requestObjectTree();

    expect(result).toBeNull();
  });

  it('should handle message bus error gracefully', async (): Promise<void> => {
    responseDispatcher.once = vi.fn().mockRejectedValue(new Error('Bus Error'));

    await expect(client.requestObjectTree()).rejects.toThrow('Bus Error');
  });

  it('should send client state', (): void => {
    const state: State = {
      attributes: [
        {
          name: 'Color',
          values: [{ value: 'Red', identifiers: ['red1'], isSelected: false }],
        },
      ],
    };
    client.sendClientState(state);

    expect(requestQueueMock).toHaveBeenCalledWith({
      type: VirtualDisplayRequestType.CLIENT_STATE,
      context: state,
    });
  });

  it('should request and receive model tree', async (): Promise<void> => {
    const modelTree = { name: 'TestModel', nodes: [] };
    responseDispatcher.once = vi
      .fn()
      .mockImplementation(
        (): Promise<{ name: string; nodes: never[] }> =>
          Promise.resolve(modelTree)
      );

    const result: VirtualDisplayResponse = await client.requestObjectTree();

    expect(result).toEqual(modelTree);
  });

  it('should send even an invalid client state', (): void => {
    const state = {
      attributes: [
        {
          name: null,
          values: [{ value: 123, identifiers: undefined, isSelected: 'nope' }],
        },
      ],
    } as unknown as State;

    expect((): void => client.sendClientState(state)).not.toThrow();
    expect(requestQueueMock).toHaveBeenCalledWith({
      type: VirtualDisplayRequestType.CLIENT_STATE,
      context: state,
    });
  });

  it('should send a model tree request with null origin if not provided', async (): Promise<void> => {
    requestQueueMock.mockClear();
    responseDispatcher.once = vi.fn().mockResolvedValue({ ok: true });

    await client.requestObjectTree();

    expect(requestQueueMock).toHaveBeenCalledWith({
      type: VirtualDisplayRequestType.OBJECT_TREE,
      context: { origin: null },
    });
  });

  it('should send a model tree request with correct context', async (): Promise<void> => {
    const testOrigin = 'https://example.com';

    requestQueueMock.mockClear();
    responseDispatcher.once = vi.fn().mockResolvedValue({ ok: true });

    await client.requestObjectTree(testOrigin);

    expect(requestQueueMock).toHaveBeenCalledWith({
      type: VirtualDisplayRequestType.OBJECT_TREE,
      context: { origin: testOrigin },
    });
  });
});
