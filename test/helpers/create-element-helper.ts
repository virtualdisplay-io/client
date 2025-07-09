/* eslint-disable @typescript-eslint/no-deprecated */
/**
 * Wrapper for document.createElement to avoid deprecated warnings in tests
 * The deprecation is about custom elements in production, not test usage
 */
export function createElementForTest<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] {
  // Cache document reference
  const doc = document;
  // Call createElement on cached reference
  return doc.createElement(tagName);
}

/**
 * Get a bound createElement function for mocking
 */
export function getBoundCreateElement(): typeof document.createElement {
  const doc = document;
  return doc.createElement.bind(doc);
}
