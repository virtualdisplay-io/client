import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  VirtualDisplayClient,
  VirtualDisplayMessageEventData,
} from '../../src';
import { messageBus } from '../../src';
import { MESSAGE_EVENT_SEND_CLIENT_STATE } from '../../src';
import { State } from '../../src';

describe('VirtualDisplayClient', () => {
  it('should ignore unknown message types', (): void => {
    const unknownMessage = { type: 'UNKNOWN_EVENT', context: null };
    window.postMessage(unknownMessage, '*');
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  it('should not throw an error if state attributes are empty', (): void => {
    const state: State = { attributes: [] };
    expect(() => client.sendClientState(state)).not.toThrow();
  });

  it('should handle null model tree gracefully', async (): Promise<void> => {
    messageBus.once = vi.fn().mockResolvedValue(null);
    const result = await client.requestModelTree();
    expect(result).toBeNull();
  });

  it('should handle message bus error gracefully', async (): Promise<void> => {
    messageBus.once = vi.fn().mockRejectedValue(new Error('Bus Error'));
    await expect(client.requestModelTree()).rejects.toThrow('Bus Error');
  });

  // @ts-ignore
  let mockPostMessage: vi.Mock;
  let client: VirtualDisplayClient;

  beforeEach((): void => {
    mockPostMessage = vi.fn();

    const iframe: HTMLIFrameElement = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
      value: {
        postMessage: mockPostMessage,
      },
      writable: true,
    });
    iframe.id = 'virtual-display';

    document.body.appendChild(iframe);

    client = new VirtualDisplayClient('#virtual-display');
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
    expect(mockPostMessage).toHaveBeenCalledWith(
      {
        type: MESSAGE_EVENT_SEND_CLIENT_STATE,
        context: state,
      },
      '*'
    );
  });

  it('should request and receive model tree', async (): Promise<void> => {
    const modelTree = { name: 'TestModel', nodes: [] };
    messageBus.once = vi
      .fn()
      .mockImplementation(
        (): Promise<{ name: string; nodes: never[] }> =>
          Promise.resolve(modelTree)
      );

    const result: VirtualDisplayMessageEventData<unknown> =
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
    expect(mockPostMessage).toHaveBeenCalledWith(
      {
        type: MESSAGE_EVENT_SEND_CLIENT_STATE,
        context: state,
      },
      '*'
    );
  });
});
