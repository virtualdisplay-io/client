import { describe, expect, it } from 'vitest';

import { MESSAGE_TYPES, Mutation } from '../../../src';
import {
  createMutationMessage,
  isValidMessage,
  isMutationMessage,
  isStateMessage,
} from '../../../src/messaging/message-utils';

describe('Message Utils - Factory Functions', () => {
  describe('createMutationMessage', () => {
    it('should create mutation message from mutations array', () => {
      const mutations = [
        Mutation.show('node1'),
        Mutation.hide('node2'),
      ];

      const result = createMutationMessage(mutations);
      const expectedLength = 2;

      expect(result.type).toBe(MESSAGE_TYPES.MUTATION);
      expect(result.mutations).toHaveLength(expectedLength);
      expect(result.mutations[0]).toEqual({ type: 'show', nodeId: 'node1' });
      expect(result.mutations[1]).toEqual({ type: 'hide', nodeId: 'node2' });
    });

    it('should throw error for non-array input', () => {
      expect(() => {
        createMutationMessage('not-array' as unknown as Mutation[]);
      }).toThrow('must be an array');
    });

    it('should handle empty mutations array', () => {
      const result = createMutationMessage([]);

      expect(result.type).toBe(MESSAGE_TYPES.MUTATION);
      expect(result.mutations).toHaveLength(0);
    });
  });
});

describe('Message Utils - Validation Functions', () => {
  describe('isValidMessage', () => {
    it('should return true for valid mutation message', () => {
      const message = {
        type: MESSAGE_TYPES.MUTATION,
        mutations: [{ type: 'show', nodeId: 'test' }],
      };

      expect(isValidMessage(message)).toBe(true);
    });

    it('should return true for valid state message', () => {
      const message = {
        type: MESSAGE_TYPES.STATE,
        nodes: [{ id: 'test', name: 'test', type: 'mesh', visible: true }],
      };

      expect(isValidMessage(message)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isValidMessage(null)).toBe(false);
      expect(isValidMessage(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isValidMessage('string')).toBe(false);
      const numberValue = 123;
      expect(isValidMessage(numberValue)).toBe(false);
    });

    it('should return false for message without type', () => {
      expect(isValidMessage({ mutations: [] })).toBe(false);
    });
  });

  describe('validation edge cases', () => {
    it('should return false for mutation message without mutations array', () => {
      expect(isValidMessage({ type: MESSAGE_TYPES.MUTATION })).toBe(false);
      expect(isValidMessage({ type: MESSAGE_TYPES.MUTATION, mutations: 'not-array' })).toBe(false);
    });

    it('should return false for state message without nodes array', () => {
      expect(isValidMessage({ type: MESSAGE_TYPES.STATE })).toBe(false);
      expect(isValidMessage({ type: MESSAGE_TYPES.STATE, nodes: 'not-array' })).toBe(false);
    });

    it('should return false for unknown message type', () => {
      expect(isValidMessage({ type: 'unknown' })).toBe(false);
    });
  });
});

describe('Message Utils - Type Checking Functions', () => {
  describe('isMutationMessage', () => {
    it('should return true for mutation message', () => {
      const message = { type: MESSAGE_TYPES.MUTATION, mutations: [] };

      expect(isMutationMessage(message)).toBe(true);
    });

    it('should return false for state message', () => {
      const message = { type: MESSAGE_TYPES.STATE, nodes: [] };

      expect(isMutationMessage(message)).toBe(false);
    });
  });

  describe('isStateMessage', () => {
    it('should return true for state message', () => {
      const message = { type: MESSAGE_TYPES.STATE, nodes: [] };

      expect(isStateMessage(message)).toBe(true);
    });

    it('should return false for mutation message', () => {
      const message = { type: MESSAGE_TYPES.MUTATION, mutations: [] };

      expect(isStateMessage(message)).toBe(false);
    });
  });
});
