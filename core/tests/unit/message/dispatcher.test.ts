import { describe, it, expect, vi, beforeEach } from 'vitest';
import { responseDispatcher } from '../../../src/message/dispatcher';
import { VirtualDisplayResponseType } from '../../../src/message/message';

describe('ResponseDispatcher', (): void => {
  beforeEach((): void => {
    // @ts-ignore - direct access for test purposes
    responseDispatcher.handlers = new Map();
  });

  it('should subscribe and publish messages', (): void => {
    const handler = vi.fn();
    responseDispatcher.subscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handler
    );
    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      context: 'test',
    });

    expect(handler).toHaveBeenCalledWith({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      context: 'test',
    });
  });

  it('should allow multiple handlers for the same message type', (): void => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    responseDispatcher.subscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handlerA
    );
    responseDispatcher.subscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handlerB
    );

    const data = { type: VirtualDisplayResponseType.OBJECT_TREE, context: 42 };
    // @ts-ignore
    responseDispatcher.publish(data);

    expect(handlerA).toHaveBeenCalledWith(data);
    expect(handlerB).toHaveBeenCalledWith(data);
  });

  it('should support one-time message handling with "once"', async (): Promise<void> => {
    const handler = vi.fn();
    responseDispatcher
      .once(VirtualDisplayResponseType.OBJECT_TREE)
      .then(handler);

    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      once: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(handler).toHaveBeenCalledWith({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      once: true,
    });
  });

  it('should not call handler after once subscription is fulfilled', async (): Promise<void> => {
    const handler = vi.fn();
    responseDispatcher
      .once(VirtualDisplayResponseType.OBJECT_TREE)
      .then(handler);

    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      once: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      once: false,
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call unsubscribed handlers', (): void => {
    const handler = vi.fn();
    responseDispatcher.subscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handler
    );
    responseDispatcher.unsubscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handler
    );

    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      context: 'test',
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle unsubscribe when no handlers are registered', (): void => {
    expect((): void => {
      responseDispatcher.unsubscribe(
        VirtualDisplayResponseType.OBJECT_TREE,
        vi.fn()
      );
    }).not.toThrow();
  });

  it('should only remove the correct handler when multiple are registered', (): void => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    responseDispatcher.subscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handlerA
    );
    responseDispatcher.subscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handlerB
    );

    responseDispatcher.unsubscribe(
      VirtualDisplayResponseType.OBJECT_TREE,
      handlerA
    );
    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      test: true,
    });

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalledWith({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      test: true,
    });
  });

  it('should do nothing if publishing to a type with no handlers', (): void => {
    expect((): void => {
      return responseDispatcher.publish({
        // @ts-ignore
        type: 'non-existing-type',
      });
    }).not.toThrow();
  });

  it('should do nothing if unsubscribing a handler from an unknown type', (): void => {
    expect((): void => {
      // @ts-ignore
      responseDispatcher.unsubscribe('random-non-existent-type', vi.fn());
    }).not.toThrow();
  });

  it('once() should resolve only once even if published multiple times', async (): Promise<void> => {
    const handler = vi.fn();
    const promise = responseDispatcher
      .once(VirtualDisplayResponseType.OBJECT_TREE)
      .then(handler);

    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      val: 1,
    });

    responseDispatcher.publish({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      // @ts-ignore
      val: 2,
    });

    await promise;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      type: VirtualDisplayResponseType.OBJECT_TREE,
      val: 1,
    });
  });

  it('should handle CLIENT_STATE response type', (): void => {
    const handler = vi.fn();
    responseDispatcher.subscribe(
      VirtualDisplayResponseType.CLIENT_STATE,
      handler
    );

    const stateResponse = {
      type: VirtualDisplayResponseType.CLIENT_STATE,
      context: {
        objectTree: {
          tree: {
            name: 'Scene',
            type: 'Scene',
            hasChildren: true,
            visible: true,
            children: [
              {
                name: 'TableTop',
                type: 'Mesh',
                hasChildren: false,
                visible: true,
                children: [],
              },
              {
                name: 'Legs',
                type: 'Mesh',
                hasChildren: false,
                visible: true,
                children: [],
              },
            ],
          },
          variants: [
            { name: 'red-variant', visible: true },
            { name: 'blue-variant', visible: false },
          ],
        },
      },
    };

    responseDispatcher.publish(stateResponse);

    expect(handler).toHaveBeenCalledWith(stateResponse);
  });

  it('should handle once() for CLIENT_STATE response', async (): Promise<void> => {
    const handler = vi.fn();
    const promise = responseDispatcher
      .once(VirtualDisplayResponseType.CLIENT_STATE)
      .then(handler);

    const stateResponse = {
      type: VirtualDisplayResponseType.CLIENT_STATE,
      context: {
        objectTree: {
          tree: {
            name: 'Scene',
            type: 'Scene',
            hasChildren: false,
            visible: true,
            children: [],
          },
          variants: [],
        },
      },
    };

    responseDispatcher.publish(stateResponse);
    await promise;

    expect(handler).toHaveBeenCalledWith(stateResponse);
  });
});
