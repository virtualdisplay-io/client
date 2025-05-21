import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualDisplayClient } from '../../src';
import { messageBus } from '../../src';
import {
  MESSAGE_EVENT_SEND_CLIENT_STATE,
} from '../../src';
import { State } from '../../src';

describe('VirtualDisplayClient', () => {
  it('should throw an error if iframe is not found', () => {
    client = new VirtualDisplayClient('#non-existent-iframe');
    expect(() => client.sendClientState({ attributes: [] })).toThrowError(
      "Iframe with selector '#non-existent-iframe' not found."
    );
  });

  it('should throw an error if element is not an iframe', () => {
    const div = document.createElement('div');
    div.id = 'not-an-iframe';
    document.body.appendChild(div);

    client = new VirtualDisplayClient('#not-an-iframe');
    expect(() => client.sendClientState({ attributes: [] })).toThrowError(
      "Element with selector '#not-an-iframe' is not an iframe."
    );
  });

  it('should ignore unknown message types', () => {
    const unknownMessage = { type: 'UNKNOWN_EVENT', context: null };
    window.postMessage(unknownMessage, '*');
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  it('should not throw an error if state attributes are empty', () => {
    const state: State = { attributes: [] };
    expect(() => client.sendClientState(state)).not.toThrow();
  });

  it('should handle null model tree gracefully', async () => {
    messageBus.once = vi.fn().mockResolvedValue(null);
    const result = await client.requestModelTree();
    expect(result).toBeNull();
  });

  it('should handle message bus error gracefully', async () => {
    messageBus.once = vi.fn().mockRejectedValue(new Error('Bus Error'));
    await expect(client.requestModelTree()).rejects.toThrow('Bus Error');
  });

  it('should throw an error if iframe selector is an empty string', () => {
    expect(() => new VirtualDisplayClient('')).toThrowError(
      'Iframe selector cannot be an empty string.'
    );
  });

  it.skip('should throw an error if sending message to iframe fails due to cross-origin restrictions', () => {
    mockPostMessage.mockImplementation(() => {
      throw new DOMException('SecurityError', 'SecurityError');
    });
    expect(() => client.sendClientState({ attributes: [] })).toThrowError(
      'Failed to send message to iframe due to cross-origin restrictions.'
    );
  });

  let client: VirtualDisplayClient;
  let mockPostMessage: vi.Mock;

  beforeEach(() => {
    mockPostMessage = vi.fn();
    const iframe = document.createElement('iframe');
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

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should send client state', () => {
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

  it('should request and receive model tree', async () => {
    const modelTree = { name: 'TestModel', nodes: [] };
    messageBus.once = vi
      .fn()
      .mockImplementation(() => Promise.resolve(modelTree));
    const result = await client.requestModelTree();
    expect(result).toEqual(modelTree);
  });
});
