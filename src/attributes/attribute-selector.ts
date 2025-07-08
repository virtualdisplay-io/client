import type { Attribute } from './attribute';
import type { AttributeService } from './attribute-service';
import type { AttributeValue } from './attribute-value';
import { VirtualdisplayError } from '../client/virtualdisplay-error';

/**
 * Public API for selecting attribute values
 * Provides fluent interface for client usage
 */
export class AttributeSelector {
  private readonly attributeService: AttributeService;

  private readonly attributeName: string;

  constructor(attributeService: AttributeService, attributeName: string) {
    this.attributeService = attributeService;
    this.attributeName = attributeName;
  }

  /**
   * Select a value for this attribute
   * Fire-and-forget: returns immediately, 3D updates asynchronously
   * @returns this AttributeSelector for method chaining
   * @throws {VirtualdisplayError} When value not found for attribute
   */
  public select(value: string): AttributeSelector {
    const attribute = this.getAttribute(this.attributeName);
    if (attribute === undefined) {
      throw VirtualdisplayError.attributeNotFound(this.attributeName);
    }

    if (!attribute.hasValue(value)) {
      throw VirtualdisplayError.valueNotFound(this.attributeName, value);
    }

    this.attributeService.selectAttributeValue(this.attributeName, value);
    return this;
  }

  public get name(): string {
    return this.attributeName;
  }

  public get currentValue(): string | undefined {
    const attribute = this.getAttribute(this.attributeName);
    return attribute?.currentSelection;
  }

  public get availableValues(): string[] {
    const attribute = this.getAttribute(this.attributeName);
    if (attribute === undefined) {
      return [];
    }

    return attribute.getAllValues().map((value: AttributeValue) => value.value);
  }

  /**
   * Register a callback to be called when any value's selection state changes
   * This registers the callback on all AttributeValue objects for this attribute
   * @param callback Function to call when selection state changes
   * @returns this AttributeSelector for method chaining
   */
  public onChange(callback: () => void): AttributeSelector {
    const values = this.getValues();
    values.forEach(value => {
      // Bind the callback to preserve the context
      value.setOnChange(() => callback());
    });
    return this;
  }

  /**
   * Get all AttributeValue objects for direct property access
   * @returns Array of AttributeValue objects
   */
  public getValues(): AttributeValue[] {
    const attribute = this.getAttribute(this.attributeName);
    if (attribute === undefined) {
      return [];
    }

    return attribute.getAllValues();
  }

  /**
   * Get a specific AttributeValue object by value name
   * @param value The value name to find
   * @returns AttributeValue object or undefined if not found
   */
  public getValue(value: string): AttributeValue | undefined {
    return this.getValues().find(v => v.value === value);
  }

  private getAttribute(attributeName: string): Attribute | undefined {
    return this.attributeService.getAttribute(attributeName);
  }
}
