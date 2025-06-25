import { describe, expect, it } from 'vitest';

import { Mutation } from '../../../src';
import { createMutationMessage } from '../../../src/messaging/message-utils';

describe('MutationDTO Conversion', () => {
  it('should convert Mutation objects to plain DTO objects', () => {
    const showMutation = Mutation.show('node1');
    const hideMutation = Mutation.hide('node2');

    const message = createMutationMessage([showMutation, hideMutation]);

    expect(message.type).toBe('mutation');
    expect(message.mutations[0]?.type).toBe('show');
    expect(message.mutations[0]?.nodeId).toBe('node1');
    expect(message.mutations[1]?.type).toBe('hide');
    expect(message.mutations[1]?.nodeId).toBe('node2');
  });
});
