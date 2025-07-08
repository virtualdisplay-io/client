/**
 * Types of mutations that can be applied to 3D nodes
 */
export const MUTATION_TYPES = {
  SHOW: 'show',
  HIDE: 'hide',
} as const;

export type MutationType = typeof MUTATION_TYPES[keyof typeof MUTATION_TYPES];

/**
 * Data Transfer Object for mutations
 * Plain object for client-server communication without methods
 */
export interface MutationDto {
  readonly type: MutationType;
  readonly nodeId: string;
}

/**
 * A mutation represents a change to be applied to a 3D node
 * This is a pure data class with no side effects
 */
export class Mutation {
  public readonly type: MutationType;

  public readonly nodeId: string;

  constructor(type: MutationType, nodeId: string) {
    this.type = type;
    this.nodeId = nodeId;
  }

  public static show(nodeId: string): Mutation {
    return new Mutation(MUTATION_TYPES.SHOW, nodeId);
  }

  public static hide(nodeId: string): Mutation {
    return new Mutation(MUTATION_TYPES.HIDE, nodeId);
  }

  public inverse(): Mutation {
    const inverseType = this.type === MUTATION_TYPES.SHOW
      ? MUTATION_TYPES.HIDE
      : MUTATION_TYPES.SHOW;

    return new Mutation(inverseType, this.nodeId);
  }

  public equals(other: Mutation): boolean {
    return this.type === other.type && this.nodeId === other.nodeId;
  }

  public toDto(): MutationDto {
    return {
      type: this.type,
      nodeId: this.nodeId,
    };
  }
}
