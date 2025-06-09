/**
 * Accessibility testing helpers for Vitest
 */
import { logger } from '../../src/utils/logger';

interface A11yViolation {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  element?: string;
}

/**
 * Check for common accessibility violations
 */
export function checkA11y(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = [];

  // Check images for alt text
  const images = element.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('alt')) {
      violations.push({
        rule: 'img-alt',
        severity: 'error',
        message: 'Images must have alt text',
        element: img.outerHTML,
      });
    }
  });

  // Check iframes for title
  const iframes = element.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    if (!iframe.hasAttribute('title')) {
      violations.push({
        rule: 'iframe-title',
        severity: 'error',
        message: 'Iframes must have a title attribute',
        element: iframe.outerHTML,
      });
    }
  });

  // Check form inputs for labels
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    if (id) {
      const label = element.querySelector(`label[for="${id}"]`);
      if (
        !label &&
        !input.getAttribute('aria-label') &&
        !input.getAttribute('aria-labelledby')
      ) {
        violations.push({
          rule: 'label-association',
          severity: 'error',
          message: 'Form controls must have associated labels',
          element: input.outerHTML,
        });
      }
    }
  });

  // Check buttons for text content
  const buttons = element.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      violations.push({
        rule: 'button-name',
        severity: 'error',
        message: 'Buttons must have accessible text',
        element: button.outerHTML,
      });
    }
  });

  // Check headings for content
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading) => {
    if (!heading.textContent?.trim()) {
      violations.push({
        rule: 'heading-content',
        severity: 'error',
        message: 'Headings must have content',
        element: heading.outerHTML,
      });
    }
  });

  // Check for positive tabindex
  const tabindexElements = element.querySelectorAll('[tabindex]');
  tabindexElements.forEach((el) => {
    const tabindex = parseInt(el.getAttribute('tabindex') || '0');
    if (tabindex > 0) {
      violations.push({
        rule: 'tabindex-positive',
        severity: 'warning',
        message: 'Avoid positive tabindex values',
        element: el.outerHTML,
      });
    }
  });

  // Check ARIA attributes
  const ariaElements = element.querySelectorAll(
    '[aria-label], [aria-labelledby], [aria-describedby]'
  );
  ariaElements.forEach((el) => {
    // Check aria-labelledby references exist
    const labelledby = el.getAttribute('aria-labelledby');
    if (labelledby) {
      const ids = labelledby.split(' ');
      ids.forEach((id) => {
        if (!element.querySelector(`#${id}`)) {
          violations.push({
            rule: 'aria-valid-references',
            severity: 'error',
            message: `aria-labelledby references non-existent element: #${id}`,
            element: el.outerHTML,
          });
        }
      });
    }
  });

  return violations;
}

/**
 * Assert no accessibility violations
 */
export function expectNoA11yViolations(element: Element): void {
  const violations = checkA11y(element);

  if (violations.length > 0) {
    const errorMessages = violations
      .map(
        (v) =>
          `${v.severity.toUpperCase()}: ${v.message} (${v.rule})\n${v.element || ''}`
      )
      .join('\n\n');

    throw new Error(`Accessibility violations found:\n\n${errorMessages}`);
  }
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Naturally keyboard accessible elements
  const accessibleTags = ['a', 'button', 'input', 'select', 'textarea'];
  if (accessibleTags.includes(tagName)) {
    return true;
  }

  // Check for tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex && parseInt(tabindex) >= 0) {
    return true;
  }

  return false;
}

/**
 * Check if element has accessible name
 */
export function hasAccessibleName(element: Element): boolean {
  // Check aria-label
  if (element.getAttribute('aria-label')) {
    return true;
  }

  // Check aria-labelledby
  const labelledby = element.getAttribute('aria-labelledby');
  if (labelledby) {
    const labels = labelledby
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    return labels.length > 0;
  }

  // Check for associated label (for form controls)
  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return true;
  }

  // Check text content for buttons and links
  const tagName = element.tagName.toLowerCase();
  if (['button', 'a'].includes(tagName) && element.textContent?.trim()) {
    return true;
  }

  return false;
}

/**
 * Simulate screen reader announcement
 */
export function simulateScreenReaderAnnouncement(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  logger.info(`Screen Reader ${priority.toUpperCase()}: ${message}`);
}
