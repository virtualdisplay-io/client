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
      this.updateState(message.nodes);
    }
  }

  private updateState(newNodes: ModelNodeDto[]): void {
    const wasInitial = !this.hasInitialState;

    logger.debug('Updating state with nodes from server', {
      incomingNodes: newNodes.length,
      isInitialState: wasInitial,
      currentNodes: this.nodeCount,
    });

    for (const nodeData of newNodes) {
      this.updateOrCreateNode(nodeData);
    }

    this.eventBus.emit(EVENT_NAMES.STATE_CHANGED, {
      nodes: this.getAllNodes(),
    });

    logger.info('State updated', {
      totalNodes: this.nodeCount,
      wasInitialState: wasInitial,
    });

    if (wasInitial) {
      logger.info('Initial state received - client is now ready');
    }
  }

  private updateOrCreateNode(newNodeData: ModelNodeDto): void {
    const existingNode = this.nodes.get(newNodeData.id);

    if (existingNode === undefined) {
      this.createNewNode(newNodeData);
      return;
    }

    const visibilityMethod = newNodeData.visible ? 'show' : 'hide';
    existingNode[visibilityMethod]();

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
    return this.hasInitialState;
  }

  public get nodeCount(): number {
    return this.nodes.size;
  }

  private get hasInitialState(): boolean {
    return this.nodeCount > 0;
  }

  public clear(): void {
    this.nodes.clear();
  }
}
