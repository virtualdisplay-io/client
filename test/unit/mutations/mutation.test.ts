import { describe, expect, it } from 'vitest';

import { Mutation, MUTATION_TYPES } from '../../../src';

describe('Mutation', () => {
  it('should create inverse mutation', () => {
    const showMutation = Mutation.show('node1');
    const hideMutation = showMutation.inverse();

    expect(hideMutation.type).toBe(MUTATION_TYPES.HIDE);
    expect(hideMutation.nodeId).toBe('node1');

    const backToShow = hideMutation.inverse();
    expect(backToShow.type).toBe(MUTATION_TYPES.SHOW);
    expect(backToShow.nodeId).toBe('node1');
  });

  it('should check equality', () => {
    const mutation1 = Mutation.show('node1');
    const mutation2 = Mutation.show('node1');
    const mutation3 = Mutation.hide('node1');
    const mutation4 = Mutation.show('node2');

    expect(mutation1.equals(mutation2)).toBe(true);
    expect(mutation1.equals(mutation3)).toBe(false);
    expect(mutation1.equals(mutation4)).toBe(false);
  });
});
