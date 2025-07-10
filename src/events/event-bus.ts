import type { DomainEvents } from './event-types';

type EventListener<T> = (payload: T) => void;
type AnyEventListener = EventListener<DomainEvents[keyof DomainEvents]>;
type EventMap = Map<keyof DomainEvents, AnyEventListener[]>;

/**
 * EventBus for domain coordination
 * Provides loose coupling between domains via events
 */
export class EventBus {
  private readonly listeners: EventMap = new Map();

  public on<K extends keyof DomainEvents>(
    event: K,
    listener: EventListener<DomainEvents[K]>,
  ): void {
    const handlers = this.listeners.get(event) ?? [];
    handlers.push(listener as AnyEventListener);
    this.listeners.set(event, handlers);
  }

  public emit<K extends keyof DomainEvents>(event: K, payload: DomainEvents[K]): void {
    const handlers = this.listeners.get(event);

    if (handlers === undefined || handlers.length === 0) {
      return;
    }

    // Create a copy to avoid modification during iteration
    // This is important for 'once' handlers that remove themselves
    const handlersCopy = [...handlers];

    handlersCopy.forEach((listener) => {
      listener(payload);
    });
  }

  /**
   * Register a listener that will be called only once
   * The listener is automatically removed after the first call
   */
  public once<K extends keyof DomainEvents>(
    event: K,
    listener: EventListener<DomainEvents[K]>,
  ): void {
    const onceWrapper: EventListener<DomainEvents[K]> = payload => {
      // Remove this wrapper before calling the listener
      // This ensures the listener is only called once
      this.off(event, onceWrapper);
      listener(payload);
    };

    this.on(event, onceWrapper);
  }

  /**
   * Remove a specific listener for an event
   */
  public off<K extends keyof DomainEvents>(
    event: K,
    listener: EventListener<DomainEvents[K]>,
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers === undefined) {
      return;
    }

    const index = handlers.indexOf(listener as AnyEventListener);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
}
