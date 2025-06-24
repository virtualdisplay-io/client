import { describe, expect, it, vi } from 'vitest';

import { EVENT_NAMES, ModelNode } from '../../../src';
import { EventBus } from '../../../src/events/event-bus';

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const bus = new EventBus();
    const spy = vi.fn();

    bus.on(EVENT_NAMES.MUTATION_MESSAGE, spy);
    bus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
      message: { type: 'mutation', mutations: [] },
    });

    expect(spy).toHaveBeenCalledWith({
      message: { type: 'mutation', mutations: [] },
    });
  });

  it('should remove listeners', () => {
    const bus = new EventBus();
    const spy = vi.fn();

    bus.on(EVENT_NAMES.MUTATION_MESSAGE, spy);
    bus.off(EVENT_NAMES.MUTATION_MESSAGE, spy);
    bus.emit(EVENT_NAMES.MUTATION_MESSAGE, {
      message: { type: 'mutation', mutations: [] },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should allow multiple listeners on same event', () => {
    const bus = new EventBus();
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    bus.on(EVENT_NAMES.STATE_CHANGED, spy1);
    bus.on(EVENT_NAMES.STATE_CHANGED, spy2);

    const testNode = new ModelNode({ id: '1', name: 'test', type: 'mesh', visible: true });
    bus.emit(EVENT_NAMES.STATE_CHANGED, { nodes: [testNode] });

    expect(spy1).toHaveBeenCalledWith({ nodes: [testNode] });
    expect(spy2).toHaveBeenCalledWith({ nodes: [testNode] });
  });

  it('should isolate events between instances', () => {
    const bus1 = new EventBus();
    const bus2 = new EventBus();
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    bus1.on(EVENT_NAMES.STATE_CHANGED, spy1);
    bus2.on(EVENT_NAMES.STATE_CHANGED, spy2);

    const testNode2 = new ModelNode({ id: '1', name: 'test', type: 'mesh', visible: true });
    bus1.emit(EVENT_NAMES.STATE_CHANGED, { nodes: [testNode2] });

    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });
});
