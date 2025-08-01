import type { AttributeValue } from './attribute-value';
import type { Mutation } from '../mutations/mutation';

/**
 * Pure domain aggregate for managing attribute values
 * No side effects - only business logic and state management
 */
export class Attribute {
  private readonly attributeName: string;

  private readonly values = new Map<string, AttributeValue>();

  constructor(name: string) {
    this.attributeName = name;
  }

  public addValue(attributeValue: AttributeValue): void {
    this.values.set(attributeValue.value, attributeValue);
  }


  public getDefaultMutations(): Mutation[] {
    return Array.from(this.values.values())
      .flatMap(value => value.getMutations());
  }

  public getCurrentValue(): AttributeValue | undefined {
    const valueArray = Array.from(this.values.values());
    return valueArray.find(v => v.isSelected);
  }

  public getValue(valueName: string): AttributeValue | undefined {
    return this.values.get(valueName);
  }

  public getAllValues(): AttributeValue[] {
    return Array.from(this.values.values());
  }

  public hasValue(valueName: string): boolean {
    return this.values.has(valueName);
  }

  public get name(): string {
    return this.attributeName;
  }

  public get currentSelection(): string | undefined {
    return this.getCurrentValue()?.value;
  }

  public clear(): void {
    this.values.clear();
  }
}
