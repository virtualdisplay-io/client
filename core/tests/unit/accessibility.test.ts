import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  announceToScreenReader,
  createScreenReaderAnnouncer,
  manageFocus,
  trapFocus,
  addKeyboardNavigation,
  createDebouncedAnnouncer,
} from '../../src/utils/accessibility';

describe('Accessibility Utilities', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
    });
    document = dom.window.document;
    window = dom.window as unknown as Window;

    // Set global document and window
    global.document = document;
    global.window = window;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('createScreenReaderAnnouncer', () => {
    it('should create a visually hidden announcer element', () => {
      const announcer = createScreenReaderAnnouncer();

      expect(announcer.tagName).toBe('DIV');
      expect(announcer.className).toBe('sr-only');
      expect(announcer.getAttribute('aria-live')).toBe('polite');
      expect(announcer.getAttribute('aria-atomic')).toBe('true');
      expect(document.body.contains(announcer)).toBe(true);
    });

    it('should add sr-only styles to document', () => {
      createScreenReaderAnnouncer();

      const style = document.querySelector('style[data-vd-sr-only]');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('.sr-only');
    });

    it('should not duplicate styles when called multiple times', () => {
      createScreenReaderAnnouncer();
      createScreenReaderAnnouncer();

      const styles = document.querySelectorAll('style[data-vd-sr-only]');
      expect(styles.length).toBe(1);
    });
  });

  describe('announceToScreenReader', () => {
    it('should announce message with polite priority by default', () => {
      announceToScreenReader('Test message');

      const announcer = document.querySelector('[data-vd-announcer]');
      expect(announcer?.textContent).toBe('Test message');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should announce message with assertive priority when specified', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcer = document.querySelector('[data-vd-announcer]');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should clear announcement after timeout', async () => {
      vi.useFakeTimers();

      announceToScreenReader('Temporary message');
      const announcer = document.querySelector('[data-vd-announcer]');

      expect(announcer?.textContent).toBe('Temporary message');

      vi.advanceTimersByTime(1000);

      expect(announcer?.textContent).toBe('');

      vi.useRealTimers();
    });
  });

  describe('manageFocus', () => {
    it('should focus element and return restore function', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      document.body.appendChild(button1);
      document.body.appendChild(button2);

      button1.focus();
      expect(document.activeElement).toBe(button1);

      const restore = manageFocus(button2);
      expect(document.activeElement).toBe(button2);

      if (typeof restore === 'function') {
        restore();
        expect(document.activeElement).toBe(button1);
      }
    });

    it('should handle null element gracefully', () => {
      const result = manageFocus(null);
      expect(result).toBeUndefined();
    });
  });

  describe('trapFocus', () => {
    it('should trap focus within container', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      // Focus last element
      button3.focus();

      // Simulate Tab key
      const tabEvent = new window.KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      container.dispatchEvent(tabEvent);

      // Cleanup
      cleanup();
    });
  });

  describe('addKeyboardNavigation', () => {
    it('should add tabindex to items without it', () => {
      const list = document.createElement('ul');
      const item1 = document.createElement('li');
      const item2 = document.createElement('li');

      list.appendChild(item1);
      list.appendChild(item2);
      document.body.appendChild(list);

      addKeyboardNavigation(list, 'li');

      expect(item1.getAttribute('tabindex')).toBe('0');
      expect(item2.getAttribute('tabindex')).toBe('0');
    });

    it('should handle arrow key navigation', () => {
      const list = document.createElement('ul');
      const item1 = document.createElement('li');
      const item2 = document.createElement('li');

      list.appendChild(item1);
      list.appendChild(item2);
      document.body.appendChild(list);

      const cleanup = addKeyboardNavigation(list, 'li');

      // Simulate ArrowDown
      const arrowDownEvent = new window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      });
      list.dispatchEvent(arrowDownEvent);

      // Cleanup
      cleanup();
    });
  });

  describe('createDebouncedAnnouncer', () => {
    it('should debounce announcements', () => {
      vi.useFakeTimers();

      const announce = createDebouncedAnnouncer(500);

      announce('First message');
      announce('Second message');
      announce('Third message');

      // No announcement yet
      let announcer = document.querySelector('[data-vd-announcer]');
      expect(announcer).toBeNull();

      // Advance time
      vi.advanceTimersByTime(500);

      // Only last message announced
      announcer = document.querySelector('[data-vd-announcer]');
      expect(announcer?.textContent).toBe('Third message');

      vi.useRealTimers();
    });
  });
});
