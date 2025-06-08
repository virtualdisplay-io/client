/**
 * Accessibility utility functions for WCAG 2.1 AA compliance
 */

/**
 * Creates a visually hidden element for screen reader announcements
 */
export function createScreenReaderAnnouncer(): HTMLDivElement {
  const announcer = document.createElement('div');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');

  // CSS for screen reader only content
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `;

  if (!document.querySelector('style[data-vd-sr-only]')) {
    style.setAttribute('data-vd-sr-only', 'true');
    document.head.appendChild(style);
  }

  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Announces a message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  let announcer = document.querySelector(
    '[data-vd-announcer]'
  ) as HTMLDivElement;

  if (!announcer) {
    announcer = createScreenReaderAnnouncer();
    announcer.setAttribute('data-vd-announcer', 'true');
  }

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

/**
 * Manages focus for better keyboard navigation
 * Returns a function to restore previous focus
 */
export function manageFocus(element: HTMLElement | null): (() => void) | void {
  if (!element) return;

  // Store previous focus
  const previousFocus = document.activeElement as HTMLElement;

  // Set focus to new element
  element.focus();

  // Return focus restoration function
  return () => {
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  };
}

/**
 * Traps focus within a container (useful for modals/dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Adds keyboard navigation to a list of items
 */
export function addKeyboardNavigation(
  container: HTMLElement,
  itemSelector: string,
  onSelect?: (item: HTMLElement) => void
): () => void {
  const items = Array.from(
    container.querySelectorAll<HTMLElement>(itemSelector)
  );
  let currentIndex = -1;

  function handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        items[currentIndex]?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        items[currentIndex]?.focus();
        break;

      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        items[currentIndex]?.focus();
        break;

      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        items[currentIndex]?.focus();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0 && onSelect) {
          onSelect(items[currentIndex]);
        }
        break;
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Make items focusable if they aren't already
  items.forEach((item) => {
    if (!item.hasAttribute('tabindex')) {
      item.setAttribute('tabindex', '0');
    }
  });

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Debounces screen reader announcements to prevent spam
 */
export function createDebouncedAnnouncer(
  delay: number = 500
): (message: string) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (message: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      announceToScreenReader(message);
      timeoutId = null;
    }, delay);
  };
}
