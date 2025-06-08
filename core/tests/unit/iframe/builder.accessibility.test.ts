import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createVirtualDisplayClientWithIframe } from '../../../src/iframe/builder';
import { expectNoA11yViolations, hasAccessibleName } from '../../helpers/a11y';

describe('Iframe Builder - Accessibility', () => {
  let dom: JSDOM;
  let document: Document;
  let container: HTMLElement;

  beforeEach(() => {
    dom = new JSDOM(
      '<!DOCTYPE html><html><body><div id="container"></div></body></html>',
      {
        url: 'http://localhost',
      }
    );
    document = dom.window.document;
    global.document = document;
    global.window = dom.window as unknown as Window;
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLIFrameElement = dom.window.HTMLIFrameElement;

    container = document.getElementById('container')! as HTMLElement;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('iframe title attribute', () => {
    it('should use provided title', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
        title: 'Custom 3D Viewer Title',
      });

      const iframe = container.querySelector('iframe');
      expect(iframe?.getAttribute('title')).toBe('Custom 3D Viewer Title');
    });

    it('should provide default title when not specified', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
      });

      const iframe = container.querySelector('iframe');
      expect(iframe?.getAttribute('title')).toBe(
        'Virtual Display 3D Model Viewer'
      );
    });

    it('should provide default title even with empty string', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
        title: '',
      });

      const iframe = container.querySelector('iframe');
      expect(iframe?.getAttribute('title')).toBe(
        'Virtual Display 3D Model Viewer'
      );
    });
  });

  describe('accessibility compliance', () => {
    it('should create iframe with no accessibility violations', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
        title: 'Product Configurator',
      });

      expectNoA11yViolations(container);
    });

    it('should have accessible name via title', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
      });

      const iframe = container.querySelector('iframe')!;
      expect(iframe.hasAttribute('title')).toBe(true);
      expect(iframe.getAttribute('title')).not.toBe('');
    });
  });

  describe('iframe attributes', () => {
    it('should set allowfullscreen by default', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
      });

      const iframe = container.querySelector('iframe');
      // Note: Some browsers use 'allowfullscreen', others use 'allowFullscreen'
      expect(
        iframe?.hasAttribute('allowfullscreen') ||
          iframe?.hasAttribute('allowFullscreen')
      ).toBe(true);
    });

    it('should apply custom CSS classes', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
        classNames: 'custom-class w-full h-full',
      });

      const iframe = container.querySelector('iframe');
      expect(iframe?.className).toBe('custom-class w-full h-full');
    });

    it('should apply inline styles', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
        style: {
          width: '100%',
          height: '400px',
          backgroundColor: 'red',
        },
      });

      const iframe = container.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.style.width).toBe('100%');
      expect(iframe.style.height).toBe('400px');
      expect(iframe.style.backgroundColor).toBe('red');
    });
  });

  describe('focus management', () => {
    it('should be focusable by default', () => {
      createVirtualDisplayClientWithIframe({
        parent: container,
        license: 'test',
        model: 'test',
      });

      const iframe = container.querySelector('iframe') as HTMLIFrameElement;

      // Iframes are focusable by default
      iframe.focus();
      expect(document.activeElement).toBe(iframe);
    });
  });

  describe('error handling with accessibility context', () => {
    it('should provide meaningful error for missing parent', () => {
      expect(() => {
        createVirtualDisplayClientWithIframe({
          parent: '#non-existent',
          license: 'test',
          model: 'test',
        });
      }).toThrow(
        'Parent element with selector "#non-existent" not found in the DOM.'
      );
    });
  });
});
