import { ModelNode, type NodeType } from './node';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import type { Message, ModelNodeDto } from '../messaging/message-types';
import { isStateMessage } from '../messaging/message-utils';
import { logger } from '../utils/logger';

/**
 * Application service for managing node state
 * Handles state updates from server and emits node change events
 */
export class StateService {
  private readonly nodes = new Map<string, ModelNode>();

  private readonly eventBus: EventBus;

  private hasReceivedInitialSync = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;

    this.eventBus.on(EVENT_NAMES.MESSAGE_RECEIVED, (event: { message: unknown }) => {
      this.handleMessage(event.message as Message);
    });
  }

  private handleMessage(message: Message): void {
    logger.debug('Handling message in StateService', {
      type: message.type,
      currentNodeCount: this.nodeCount,
    });

    if (isStateMessage(message)) {
      this.updateState(message.nodes, message.isInitial);
    }
  }

  private updateState(newNodes: ModelNodeDto[], isInitial: boolean): void {
    logger.debug('Updating state with nodes from server', {
      incomingNodes: newNodes.length,
      isInitialState: isInitial,
      currentNodes: this.nodeCount,
    });

    for (const nodeData of newNodes) {
      const shouldProcessNode = !isInitial || !this.nodes.has(nodeData.id);
      if (shouldProcessNode) {
        this.updateOrCreateNode(nodeData);
      }
    }

    this.eventBus.emit(EVENT_NAMES.STATE_CHANGED, {
      nodes: this.getAllNodes(),
    });

    logger.info('State updated', {
      totalNodes: this.nodeCount,
      wasInitialState: isInitial,
    });

    // Emit initial state received AFTER all nodes are processed
    if (isInitial && !this.hasReceivedInitialSync) {
      this.hasReceivedInitialSync = true;
      logger.info('Initial state received - client is now ready');
      this.eventBus.emit(EVENT_NAMES.INITIAL_STATE_RECEIVED, {});
    }
  }

  private updateOrCreateNode(newNodeData: ModelNodeDto): void {
    const existingNode = this.nodes.get(newNodeData.id);

    if (existingNode === undefined) {
      this.createNewNode(newNodeData);
      return;
    }

    const previousVisibility = existingNode.isVisible;
    const visibilityMethod = newNodeData.visible ? 'show' : 'hide';
    existingNode[visibilityMethod]();

    // Trigger onChange callback if visibility changed
    if (previousVisibility !== existingNode.isVisible && existingNode.onChange !== undefined) {
      existingNode.onChange();
    }

    logger.debug('Updated existing node', {
      id: existingNode.id,
      name: existingNode.name,
      type: existingNode.type,
      visible: existingNode.isVisible,
    });
  }

  private createNewNode(newNodeData: ModelNodeDto): void {
    const newNode = new ModelNode({
      id: newNodeData.id,
      name: newNodeData.name,
      type: newNodeData.type as NodeType,
      visible: newNodeData.visible,
    });
    this.nodes.set(newNode.id, newNode);
    logger.debug('Created new node', {
      id: newNode.id,
      name: newNode.name,
      type: newNode.type,
      visible: newNode.isVisible,
    });
  }

  public getNode(id: string): ModelNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): ModelNode[] {
    return Array.from(this.nodes.values());
  }

  public get isReady(): boolean {
    return this.hasReceivedInitialSync;
  }

  public get nodeCount(): number {
    return this.nodes.size;
  }

  public clear(): void {
    this.nodes.clear();
    this.hasReceivedInitialSync = false;
  }
}
