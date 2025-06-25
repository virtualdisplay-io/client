// Test constants to avoid magic numbers
const TWO = 2;
const THREE = 3;
const ONE = 1;

export const EXPECTED_CALLS = {
  DEFAULT_AND_SELECTION: TWO,
  MUTATION_COUNT: THREE,
  QUEUE_LENGTH: TWO,
  SINGLE_CALL: ONE,
} as const;
