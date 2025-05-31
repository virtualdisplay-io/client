import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MESSAGE_EVENT_MODEL_TREE_REQUEST,
  VirtualDisplayClient,
  VirtualDisplayMessageEventData,
} from '../../src';
import { messageBus } from '../../src';
import { MESSAGE_EVENT_SEND_CLIENT_STATE } from '../../src';
import { State } from '../../src';
import { ModelTreeRequestContext } from '../../src/types/tree-request';

describe('VirtualDisplayClient', () => {
  it('should ignore unknown message types', (): void => {
    const unknownMessage = { type: 'UNKNOWN_EVENT', context: null };
    window.postMessage(unknownMessage, '*');

    expect(mockQueueSend).not.toHaveBeenCalled();
  });

  it('should not throw an error if state attributes are empty', (): void => {
    const state: State = { attributes: [] };

    expect(() => client.sendClientState(state)).not.toThrow();
  });

  it('should handle null model tree gracefully', async (): Promise<void> => {
    messageBus.once = vi.fn().mockResolvedValue(null);
    const result: VirtualDisplayMessageEventData<ModelTreeRequestContext> =
      await client.requestModelTree();

    expect(result).toBeNull();
  });

  it('should handle message bus error gracefully', async (): Promise<void> => {
    messageBus.once = vi.fn().mockRejectedValue(new Error('Bus Error'));

    await expect(client.requestModelTree()).rejects.toThrow('Bus Error');
  });

  // @ts-ignore
  let mockQueueSend: vi.Mock;
  let client: VirtualDisplayClient;

  beforeEach((): void => {
    mockQueueSend = vi.fn();

    const mockQueue = {
      send: mockQueueSend,
      flush: vi.fn(),
      isReady: true,
    };

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
      value: {
        postMessage: mockQueueSend,
      },
      writable: true,
    });
    iframe.id = 'virtual-display';

    document.body.appendChild(iframe);

    client = new VirtualDisplayClient('#virtual-display');
    // @ts-ignore
    client.queue = mockQueue;
  });

  afterEach((): void => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
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

    expect(mockQueueSend).toHaveBeenCalledWith({
      type: MESSAGE_EVENT_SEND_CLIENT_STATE,
      context: state,
    });
  });

  it('should request and receive model tree', async (): Promise<void> => {
    const modelTree = { name: 'TestModel', nodes: [] };
    messageBus.once = vi
      .fn()
      .mockImplementation(
        (): Promise<{ name: string; nodes: never[] }> =>
          Promise.resolve(modelTree)
      );

    const result: VirtualDisplayMessageEventData<ModelTreeRequestContext> =
      await client.requestModelTree();

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
    expect(mockQueueSend).toHaveBeenCalledWith({
      type: MESSAGE_EVENT_SEND_CLIENT_STATE,
      context: state,
    });
  });

  it('should send a model tree request with null origin if not provided', async (): Promise<void> => {
    mockQueueSend.mockClear();
    messageBus.once = vi.fn().mockResolvedValue({ ok: true });

    await client.requestModelTree();

    expect(mockQueueSend).toHaveBeenCalledWith({
      type: MESSAGE_EVENT_MODEL_TREE_REQUEST,
      context: { origin: null },
    });
  });

  it('should send a model tree request with correct context', async (): Promise<void> => {
    const testOrigin = 'https://example.com';

    mockQueueSend.mockClear();
    messageBus.once = vi.fn().mockResolvedValue({ ok: true });

    await client.requestModelTree(testOrigin);

    expect(mockQueueSend).toHaveBeenCalledWith({
      type: MESSAGE_EVENT_MODEL_TREE_REQUEST,
      context: { origin: testOrigin },
    });
  });
});
