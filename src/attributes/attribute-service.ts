import { Attribute } from './attribute';
import { AttributeValue } from './attribute-value';
import type { MappingConfiguration, MappingContext, DynamicValue, AttributeConfig } from './mapping-types';
import { MappingValidator } from './mapping-validator';
import type { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { createMutationMessage } from '../messaging/message-utils';
import { Mutation } from '../mutations/mutation';
import type { ModelNode } from '../nodes/node';
import { logger } from '../utils/logger';

/**
 * Application service for managing attributes
 * Handles business logic and coordinates with other domains via events
 */
export class AttributeService {
  private attributes = new Map<string, Attribute>();

  private readonly eventBus: EventBus;

  private isInitialized = false;

  // Store original config for re-evaluation
  private mappingConfig: MappingConfiguration | null = null;

  // Store current selections
  private readonly selections = new Map<string, string>();

  // Store current visible nodes per attribute
  private readonly currentState = new Map<string, Set<string>>();

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

    // Store config for re-evaluation
    this.mappingConfig = config;

    if (this.isInitialized) {
      this.attributes.clear();
      this.selections.clear();
      this.currentState.clear();
    }

    // Initial evaluation
    this.attributes = this.evaluateMapping();

    // Initialize selections from default values
    this.initializeSelections();

    // Update current state
    this.updateCurrentState();

    this.isInitialized = true;

    // Send initial mutations
    const mutations = this.getInitialMutations();
    if (mutations.length > 0) {
      const mutationMessage = createMutationMessage(mutations);
      this.eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
        message: mutationMessage,
      });
    }
  }

  public selectAttributeValue(attributeName: string, value: string): void {
    // Check if attribute exists
    const attribute = this.attributes.get(attributeName);
    if (attribute === undefined) {
      logger.warn('Attribute not found', { attributeName });
      return;
    }

    // Check if value exists in attribute
    if (!attribute.hasValue(value)) {
      logger.warn('Value not found in attribute', { attributeName, value });
      return;
    }

    // 1. Update selection
    this.selections.set(attributeName, value);

    // 2. Store current visible nodes
    const oldState = new Map(this.currentState);

    // 3. Check if we need to re-evaluate the entire mapping
    // This happens when we have dynamic mappings with dependencies
    if (this.hasDynamicMapping()) {
      // Re-evaluate the entire mapping with updated selections
      this.attributes = this.evaluateMapping();
    }

    // 4. Calculate new state based on selections
    // (AttributeValues will be updated when server responds with STATE_CHANGED)
    this.updateCurrentState();

    // 5. Calculate mutations
    const mutations = this.calculateMutations(oldState, this.currentState);

    // 6. Send mutations
    if (mutations.length > 0) {
      this.eventBus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
        message: createMutationMessage(mutations),
      });
    }
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

    // Create a map of node visibility for quick lookup
    const nodeVisibility = new Map<string, boolean>();
    for (const node of nodes) {
      nodeVisibility.set(node.id, node.isVisible);
    }

    // For each attribute, update the selected state of values based on node visibility
    for (const attribute of this.attributes.values()) {
      for (const value of attribute.getAllValues()) {
        // Check if all nodes for this value are visible
        const allNodesVisible = value.nodeList.every(
          nodeId => nodeVisibility.get(nodeId) ?? false,
        );

        // Update the selected state
        value.setSelected(allNodesVisible);
      }
    }
  }

  public clear(): void {
    this.attributes.clear();
    this.selections.clear();
    this.currentState.clear();
    this.mappingConfig = null;
    this.isInitialized = false;
  }

  /**
   * Create context for dynamic evaluation
   */
  private createContext(): MappingContext {
    return {
      getValue: (attributeName: string) => this.selections.get(attributeName),
      getAllValues: () => new Map(this.selections),
    };
  }

  /**
   * Evaluate a property that might be static or dynamic
   */
  private evaluateProperty<T>(prop: DynamicValue<T>, context: MappingContext): T {
    return typeof prop === 'function' ? (prop as (context: MappingContext) => T)(context) : prop;
  }

  /**
   * Evaluate the entire mapping with current context
   */
  private evaluateMapping(): Map<string, Attribute> {
    if (this.mappingConfig === null) {
      return new Map();
    }

    const context = this.createContext();
    const evaluatedAttributes = new Map<string, Attribute>();

    for (const attrConfig of this.mappingConfig.attributes) {
      const attribute = this.createAttributeFromConfig(attrConfig, context);
      evaluatedAttributes.set(attribute.name, attribute);
    }

    return evaluatedAttributes;
  }

  /**
   * Create a single attribute from configuration
   */
  private createAttributeFromConfig(
    attrConfig: AttributeConfig,
    context: MappingContext,
  ): Attribute {
    const attribute = new Attribute(attrConfig.name);

    // Evaluate values (might be function or array)
    const values = this.evaluateProperty(attrConfig.values, context);

    for (const valueConfig of values) {
      // Evaluate each property
      const value = this.evaluateProperty(valueConfig.value, context);
      const nodeIds = this.evaluateProperty(valueConfig.nodeIds, context);
      const isSelected = this.evaluateProperty(valueConfig.isSelected ?? false, context);

      // Check if this value is currently selected
      const currentSelection = this.selections.get(attrConfig.name);
      const shouldBeSelected = currentSelection !== undefined
        ? currentSelection === value
        : isSelected;

      const attributeValue = new AttributeValue(value, nodeIds, shouldBeSelected);
      attribute.addValue(attributeValue);

      logger.debug('Created attribute value', attributeValue);
    }

    return attribute;
  }

  /**
   * Initialize selections from default values
   */
  private initializeSelections(): void {
    for (const [name, attribute] of this.attributes) {
      const selectedValue = attribute.getCurrentValue();
      if (selectedValue !== undefined) {
        this.selections.set(name, selectedValue.value);
      }
    }
  }

  /**
   * Check if the mapping configuration contains dynamic elements
   */
  private hasDynamicMapping(): boolean {
    if (this.mappingConfig === null) {
      return false;
    }
    return MappingValidator.containsDynamicValues(this.mappingConfig);
  }

  /**
   * Update current state map with visible nodes per attribute
   */
  private updateCurrentState(): void {
    this.currentState.clear();

    for (const [name, attribute] of this.attributes) {
      const visibleNodes = this.getVisibleNodesForAttribute(name, attribute);
      this.currentState.set(name, visibleNodes);
    }
  }

  private getVisibleNodesForAttribute(name: string, attribute: Attribute): Set<string> {
    const visibleNodes = new Set<string>();
    const selectedValueName = this.selections.get(name);

    if (selectedValueName === undefined) {
      return visibleNodes;
    }

    const selectedValue = attribute.getValue(selectedValueName);
    if (selectedValue !== undefined) {
      selectedValue.nodeList.forEach(nodeId => visibleNodes.add(nodeId));
    }

    return visibleNodes;
  }

  /**
   * Get initial mutations for default selections
   */
  private getInitialMutations(): Mutation[] {
    const mutations: Mutation[] = [];

    for (const attribute of this.attributes.values()) {
      mutations.push(...attribute.getDefaultMutations());
    }

    return mutations;
  }

  /**
   * Calculate mutations by comparing old and new state
   */
  private calculateMutations(
    oldState: Map<string, Set<string>>,
    newState: Map<string, Set<string>>,
  ): Mutation[] {
    const mutations: Mutation[] = [];
    const allNodeIds = new Set<string>();

    // Collect all nodeIds from both states
    oldState.forEach(nodes => nodes.forEach(id => allNodeIds.add(id)));
    newState.forEach(nodes => nodes.forEach(id => allNodeIds.add(id)));

    // For each node, determine if visibility changed
    for (const nodeId of allNodeIds) {
      const wasVisible = this.isNodeVisible(nodeId, oldState);
      const isVisible = this.isNodeVisible(nodeId, newState);

      if (wasVisible && !isVisible) {
        mutations.push(Mutation.hide(nodeId));
      }
      if (!wasVisible && isVisible) {
        mutations.push(Mutation.show(nodeId));
      }
    }

    return mutations;
  }

  /**
   * Check if a node is visible in the given state
   */
  private isNodeVisible(nodeId: string, state: Map<string, Set<string>>): boolean {
    for (const nodes of state.values()) {
      if (nodes.has(nodeId)) {
        return true;
      }
    }
    return false;
  }
}
