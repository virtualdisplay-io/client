import { Attribute } from './attribute';
import { AttributeValue } from './attribute-value';
import type { AttributeValueConfig, MappingConfiguration } from './mapping-types';
import { MappingValidator } from './mapping-validator';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { createMutationMessage } from '../messaging/message-utils';
import type { Mutation } from '../mutations/mutation';
import type { ModelNode } from '../nodes/node';
import { logger } from '../utils/logger';

/**
 * Application service for managing attributes
 * Handles business logic and coordinates with other domains via events
 */
export class AttributeService {
  private readonly attributes = new Map<string, Attribute>();

  private readonly eventBus: EventBus;

  private isInitialized = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;

    this.eventBus.on(EVENT_NAMES.STATE_CHANGED, event => {
      this.syncStateWithAttributes(event.nodes);
    });
  }

  /**
   * Load mapping configuration and apply defaults
   * @throws {VirtualdisplayError} When mapping configuration is invalid
   */
  public loadMapping(config: MappingConfiguration): void {
    MappingValidator.validate(config);

    if (this.isInitialized) {
      this.attributes.clear();
    }

    const mutations: Mutation[] = [];

    config.attributes.forEach(attrConfig => {
      const attribute = new Attribute(attrConfig.name);

      attrConfig.values.forEach((valueConfig: AttributeValueConfig) => {
        const attributeValue = new AttributeValue(
          valueConfig.value,
          valueConfig.nodeIds,
          valueConfig.isSelected,
        );
        attribute.addValue(attributeValue);

        logger.debug('Created attribute value', attributeValue);
      });

      this.attributes.set(attribute.name, attribute);

      mutations.push(...attribute.getDefaultMutations());
    });

    this.isInitialized = true;

    if (mutations.length > 0) {
      const mutationMessage = createMutationMessage(mutations);
      this.eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
        message: mutationMessage,
      });
    }
  }

  public selectAttributeValue(attributeName: string, value: string): void {
    const attribute = this.attributes.get(attributeName);
    if (attribute === undefined) {
      return;
    }

    const mutations = attribute.select(value);
    if (mutations.length === 0) {
      return;
    }

    this.eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
      message: createMutationMessage(mutations),
    });
  }

  public getAttribute(name: string): Attribute | undefined {
    return this.attributes.get(name);
  }

  public getAllAttributes(): Attribute[] {
    return Array.from(this.attributes.values());
  }

  public get initialized(): boolean {
    return this.isInitialized;
  }

  private syncStateWithAttributes(nodes: ModelNode[]): void {
    if (!this.isInitialized) {
      return;
    }

    nodes.forEach(node => {
      const attributeValue = this.getAttributeValueForNode(node.id);
      if (attributeValue !== undefined) {
        attributeValue.setSelected(node.isVisible);
      }
    });
  }

  private getAttributeValueForNode(nodeId: string): AttributeValue | undefined {
    for (const attribute of this.attributes.values()) {
      const value = attribute.getAllValues().find(v => v.hasNode(nodeId));
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  public clear(): void {
    this.attributes.clear();
    this.isInitialized = false;
  }
}
