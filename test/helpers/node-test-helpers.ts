import { ModelNode, NODE_TYPES } from '../../src';

/**
 * Helper to create ModelNode instances for tests
 */
export function createTestNode(params: {
  id: string;
  type?: 'mesh' | 'variant';
  name?: string;
  isVisible: boolean;
}): ModelNode {
  return new ModelNode({
    id: params.id,
    name: params.name ?? params.id,
    type: params.type ?? NODE_TYPES.MESH,
    visible: params.isVisible,
  });
}

/**
 * Helper to create multiple test nodes at once
 */
export function createTestNodes(
  nodes: Array<{ id: string; type?: 'mesh' | 'variant'; name?: string; isVisible: boolean }>,
): ModelNode[] {
  return nodes.map(node => createTestNode(node));
}
