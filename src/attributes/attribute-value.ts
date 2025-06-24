import { Mutation } from '../mutations/mutation';

/**
 * Pure domain entity representing a single attribute value
 * No side effects - only business logic and data
 */
export class AttributeValue {
  private readonly attributeValue: string;

  private readonly nodeIds: string[];

  private selected: boolean;

  public onChange?: () => void;

  constructor(value: string, nodeIds: string[], isSelected = false) {
    this.attributeValue = value;
    this.nodeIds = [...nodeIds];
    this.selected = isSelected;
  }

  public getMutations(): Mutation[] {
    return this.nodeIds.map(nodeId => {
      return this.selected ? Mutation.show(nodeId) : Mutation.hide(nodeId);
    });
  }

  public setSelected(selected: boolean): void {
    this.selected = selected;

    if (this.onChange !== undefined) {
      this.onChange();
    }
  }

  public get value(): string {
    return this.attributeValue;
  }

  public get nodeList(): string[] {
    return [...this.nodeIds];
  }

  public hasNode(nodeId: string): boolean {
    return this.nodeIds.includes(nodeId);
  }

  public get isSelected(): boolean {
    return this.selected;
  }

  public setOnChange(callback: () => void): void {
    this.onChange = callback;
  }
}
