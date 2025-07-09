import { expect } from 'vitest';

import type { TestSetup } from '../feature/shared-test-setup';

export function expectMutationCall(
  setup: TestSetup,
  action: () => void,
  expectedMutations: Array<{ type: string; nodeId: string }>,
): void {
  setup.postMessageSpy.mockClear();
  action();
  expect(setup.postMessageSpy).toHaveBeenCalledTimes(1);
  const { calls } = setup.postMessageSpy.mock;
  expect(calls[0]?.[0]?.mutations).toEqual(expectedMutations);
}
