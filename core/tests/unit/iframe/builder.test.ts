import {
  describe,
  it,
  vi,
  expect,
  afterEach,
  beforeEach,
  MockInstance,
} from 'vitest';
import { createVirtualDisplayClientWithIframe } from '../../../src/iframe/builder';
import { VirtualDisplayClient } from '../../../src';
import { VirtualDisplayResponseType } from '../../../src';

// @ts-ignore
interface MockVirtualDisplayClient {
  // @ts-ignore
  onResponseSubscriber: MockInstance<
    [VirtualDisplayResponseType, (data: unknown) => void],
    void
  >;
}

const mockInstances: MockVirtualDisplayClient[] = [];

vi.mock('../../../src/client', () => {
  return {
    VirtualDisplayClient: function (this: MockVirtualDisplayClient): void {
      this.onResponseSubscriber = vi.fn();
      mockInstances.push(this);
    },
  };
});

describe('createVirtualDisplayClientWithIframe', (): void => {
  let parent: HTMLElement;

  beforeEach((): void => {
    parent = document.createElement('div');
    parent.id = 'parent';
    document.body.appendChild(parent);
  });

  afterEach((): void => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('throws if parent selector does not exist in the DOM', () => {
    expect((): void => {
      createVirtualDisplayClientWithIframe({
        parent: '#nope',
        license: 'abc',
        model: 'def',
        onReady: (): void => {},
      });
    }).toThrow('Parent element with selector "#nope" not found in the DOM.');
  });

  it('throws if parent is an HTMLElement without appendChild', () => {
    const el = document.createElement('div');
    // @ts-ignore
    el.appendChild = undefined;

    expect((): void => {
      createVirtualDisplayClientWithIframe({
        parent: el,
        license: 'abc',
        model: 'def',
        onReady: (): void => {},
      });
    }).toThrow('Provided parent is an HTMLElement but cannot append children.');
  });

  it('throws if parent is not a string or HTMLElement', () => {
    expect(
      (): VirtualDisplayClient =>
        createVirtualDisplayClientWithIframe({
          // @ts-ignore
          parent: 123,
          license: 'abc',
          model: 'def',
          onReady: (): void => {},
        })
    ).toThrow(
      'Parent must be a selector string or an HTMLElement, received: number'
    );
  });

  it('should create an iframe and append it to the parent', (): void => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady: (): void => {},
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');

    expect(iframe).not.toBeNull();
  });

  it('allows multiple iframes in parent by default', () => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady: (): void => {},
    });

    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady: (): void => {},
    });

    expect(parent.querySelectorAll('iframe').length).toBe(2);
  });

  it('should use the provided iframeId', (): void => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      iframeId: 'custom-id',
      onReady: (): void => {},
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');

    expect(iframe?.id).toBe('custom-id');
  });

  it('should call onReady with the VirtualDisplayClient instance', (): void => {
    const onReady = vi.fn();

    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady,
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');
    iframe?.dispatchEvent(new Event('load'));

    expect(onReady).toHaveBeenCalled();
    expect(onReady.mock.calls[0][0]).toBeDefined();
  });

  it('should subscribe onResponse to all VirtualDisplayResponseTypes', (): void => {
    mockInstances.length = 0; // reset de array!
    const onResponse = vi.fn();
    const onReady = vi.fn();

    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady,
      onResponse,
    });

    const spy = mockInstances[mockInstances.length - 1];
    const calls = spy.onResponseSubscriber.mock.calls;
    const types: (string | VirtualDisplayResponseType)[] = Object.values(
      // @ts-ignore
      VirtualDisplayResponseType
    );

    expect(calls.length).toBe(types.length);

    for (const t of types) {
      expect(
        // @ts-ignore
        calls.find(([type, handler]) => type === t && handler === onResponse)
      ).toBeTruthy();
    }
  });

  it('should not subscribe if onResponse is not set', (): void => {
    mockInstances.length = 0; // reset!
    const onReady = vi.fn();

    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady,
    });

    const spy = mockInstances[mockInstances.length - 1];
    expect(spy.onResponseSubscriber).not.toHaveBeenCalled();
  });

  it('should apply custom styles and keep default styles', (): void => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady: (): void => {},
      style: { border: '1px solid red' },
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');

    expect(iframe?.style.border).toBe('1px solid red');
  });

  it.skip('should set the default attributes from the factory', (): void => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady: (): void => {},
      style: { border: '1px solid red' },
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');

    expect(iframe?.style.width).toBe('100%');
    expect(iframe?.style.height).toBe('100%');
    expect(iframe?.style.display).toBe('block');
    expect(['', 'none']).toContain(iframe?.style.border);
    expect(iframe?.style.minHeight).toBe('0');
    expect(iframe?.style.minWidth).toBe('0');
    expect(iframe?.getAttribute('allowfullscreen')).toBe('');
    expect(iframe?.getAttribute('allow')).toContain('fullscreen');
    expect(iframe?.getAttribute('allow')).toContain('xr-spatial-tracking');
    expect(iframe?.getAttribute('allow')).toContain('camera');
    expect(iframe?.getAttribute('allow')).toContain('clipboard-write');
  });

  it('sets the correct iframe src with all params', () => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'lic123',
      model: 'mod456',
      debug: true,
      onReady: (): void => {},
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe')!;
    expect(iframe?.src).toContain('lic123');
    expect(iframe?.src).toContain('mod456');
    expect(iframe?.src).toContain('debug=true');
  });

  it('onReady is called after iframe load event', () => {
    const onReady = vi.fn();

    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      onReady,
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe')!;
    iframe?.dispatchEvent(new Event('load'));

    expect(onReady).toHaveBeenCalled();
  });

  it('should apply classNames', (): void => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      classNames: 'my-custom-class another-class',
      onReady: (): void => {},
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');

    expect(iframe?.className).toBe('my-custom-class another-class');
  });

  it('should apply title', (): void => {
    createVirtualDisplayClientWithIframe({
      parent,
      license: 'abc',
      model: 'def',
      title: 'My Virtual Display',
      onReady: (): void => {},
    });

    const iframe: HTMLIFrameElement | null = parent.querySelector('iframe');

    expect(iframe?.title).toBe('My Virtual Display');
  });
});
