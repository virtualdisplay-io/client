import { vi } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient, EVENT_NAMES, ModelNode, NODE_TYPES } from '../../src';
import { createElementForTest, getBoundCreateElement } from '../helpers/create-element-helper';

export interface TestSetup {
  client: VirtualdisplayClient;
  postMessageSpy: ReturnType<typeof vi.fn>;
  clientWithEventBus: { eventBus: { emit: (event: string, data: unknown) => void } };
}

export function createMockSetup(mapping: MappingConfiguration): TestSetup {
  const mockParent = createElementForTest('div');
  document.body.appendChild(mockParent);
  const postMessageSpy = vi.fn();

  // Mock postMessage on all iframes
  const originalCreateElement = getBoundCreateElement();
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'iframe') {
      const iframe = originalCreateElement('iframe') as HTMLIFrameElement;
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true,
      });
      return iframe;
    }
    return originalCreateElement(tagName);
  });

  const client = new VirtualdisplayClient({
    parent: mockParent,
    license: 'demo',
    model: 'Felt_panel',
    debug: true,
  });
  client.setMapping(mapping);

  const clientWithEventBus = client as unknown as {
    eventBus: { emit: (event: string, data: unknown) => void };
  };
  clientWithEventBus.eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

  return { client, postMessageSpy, clientWithEventBus };
}

export function simulateStateChange(
  clientWithEventBus: { eventBus: { emit: (event: string, data: unknown) => void } },
  visibleNodes: string[],
  allNodeIds: string[],
): void {
  const nodes = allNodeIds.map(nodeId => new ModelNode({
    id: nodeId,
    name: nodeId,
    type: NODE_TYPES.MESH,
    visible: visibleNodes.includes(nodeId),
  }));

  // Emit state change to EventBus (internal)
  clientWithEventBus.eventBus.emit(EVENT_NAMES.STATE_CHANGED, { nodes });

  // Also simulate server response (triggers onResponse callback)
  simulateServerResponse(clientWithEventBus, nodes);
}

export function simulateServerResponse(
  clientWithEventBus: { eventBus: { emit: (event: string, data: unknown) => void } },
  nodes: ModelNode[],
): void {
  // Simulate server response that triggers onResponse callback
  const response = {
    type: 'state',
    nodes: nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.isVisible,
    })),
  };

  // This should trigger the onResponse callback by simulating message reception
  clientWithEventBus.eventBus.emit(EVENT_NAMES.MESSAGE_RECEIVED, { message: response });
}
