import type { ModelNode } from './node';
import type { StateService } from './state-service';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { createMutationMessage } from '../messaging/message-utils';
import { Mutation } from '../mutations/mutation';
import { logger } from '../utils/logger';

/**
 * Public API for controlling individual nodes
 * Provides direct node manipulation without attribute mapping
 */
export class NodeSelector {
  private readonly eventBus: EventBus;

  private readonly stateService: StateService;

  private readonly nodeId: string;

  constructor(eventBus: EventBus, stateService: StateService, nodeId: string) {
    this.eventBus = eventBus;
    this.stateService = stateService;
    this.nodeId = nodeId;
  }

  public show(): void {
    logger.debug(`Showing node: ${this.nodeId}`);
    const mutation = Mutation.show(this.nodeId);
    this.emitMutation(mutation);
  }

  public hide(): void {
    logger.debug(`Hiding node: ${this.nodeId}`);
    const mutation = Mutation.hide(this.nodeId);
    this.emitMutation(mutation);
  }

  public toggle(): void {
    const node = this.getNode();
    if (node === undefined) {
      logger.warn(`Cannot toggle node ${this.nodeId}: node not found`);
      return;
    }

    if (node.isVisible === true) {
      this.hide();
      return;
    }
    this.show();
  }

  public get id(): string {
    return this.nodeId;
  }

  public get isVisible(): boolean {
    const node = this.getNode();
    return node?.isVisible ?? false;
  }

  public getNode(): ModelNode | undefined {
    return this.stateService.getNode(this.nodeId);
  }

  public get type(): string | undefined {
    return this.getNode()?.type;
  }

  public get name(): string | undefined {
    return this.getNode()?.name;
  }

  private emitMutation(mutation: Mutation): void {
    const mutationMessage = createMutationMessage([mutation]);
    this.eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
      message: mutationMessage,
    });
  }
}
