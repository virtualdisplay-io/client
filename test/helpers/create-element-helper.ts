/* eslint-disable @typescript-eslint/no-deprecated */
/**
 * Wrapper for document.createElement to avoid deprecated warnings in tests
 * The deprecation is about custom elements in production, not test usage
 */
export function createElementForTest<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] {
  // Call createElement on cached reference
  return document.createElement(tagName);
}

/**
 * Get a bound createElement function for mocking
 */
export function getBoundCreateElement(): typeof document.createElement {
  return document.createElement.bind(document);
}
