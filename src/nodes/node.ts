/**
 * Types of nodes in the 3D scene
 */
export const NODE_TYPES = {
  MESH: 'mesh',
  VARIANT: 'variant',
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

/**
 * Represents a 3D node in the scene
 * Live object that can be updated to reflect state changes
 */
export class ModelNode {
  public readonly id: string;

  public readonly name: string;

  public readonly type: NodeType;

  private visible: boolean;

  public onChange?: () => void;

  constructor(params: CreateNodeParams) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.visible = params.visible;
  }

  public get isVisible(): boolean {
    return this.visible;
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }
}

export interface CreateNodeParams {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
}
