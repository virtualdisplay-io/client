import { vi } from 'vitest';

import { type MappingConfiguration, VirtualdisplayClient, EVENT_NAMES, ModelNode, NODE_TYPES } from '../../src';

export interface TestSetup {
  client: VirtualdisplayClient;
  postMessageSpy: ReturnType<typeof vi.fn>;
  clientWithEventBus: { eventBus: { emit: (event: string, data: unknown) => void } };
}

export interface TestHelpers {
  getAttribute: (name: string) => ReturnType<VirtualdisplayClient['getAttribute']>;
  getValue: (attributeName: string, valueName: string) => NonNullable<ReturnType<ReturnType<VirtualdisplayClient['getAttribute']>['getValue']>>;
  getNode: (id: string) => NonNullable<ReturnType<VirtualdisplayClient['getNode']>>;
}

export function createMockSetup(mapping: MappingConfiguration): TestSetup {
  const mockParent = document.createElement('div');
  document.body.appendChild(mockParent);
  const postMessageSpy = vi.fn();

  // Mock postMessage on all iframes
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const originalCreateElement = document.createElement.bind(document);
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
    model: 'demo-product',
    license: 'demo',
    debug: true,
  });
  client.setMapping(mapping);

  const clientWithEventBus = client as unknown as {
    eventBus: { emit: (event: string, data: unknown) => void };
  };
  clientWithEventBus.eventBus.emit(EVENT_NAMES.IFRAME_READY, {});

  return { client, postMessageSpy, clientWithEventBus };
}

export function createTestHelpers(setup: TestSetup): TestHelpers {
  return {
    getAttribute: (name: string): ReturnType<VirtualdisplayClient['getAttribute']> => {
      return setup.client.getAttribute(name);
    },
    getValue: (attributeName: string, valueName: string): NonNullable<ReturnType<ReturnType<VirtualdisplayClient['getAttribute']>['getValue']>> => {
      const value = setup.client.getAttribute(attributeName).getValue(valueName);
      if (value === undefined) {
        throw new Error(`Test error: Value '${valueName}' not found in attribute '${attributeName}'`);
      }
      return value;
    },
    getNode: (id: string): NonNullable<ReturnType<VirtualdisplayClient['getNode']>> => {
      const node = setup.client.getNode(id);
      if (node === undefined) {
        throw new Error(`Test error: Node '${id}' not found`);
      }
      return node;
    },
  };
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
