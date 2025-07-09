/**
 * DOM helpers for tests
 */

/**
 * Create an element for testing
 */
export function createTestElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] {
  // Create element using DOM API
  const doc = document;
  return doc.createElement(tagName);
}
