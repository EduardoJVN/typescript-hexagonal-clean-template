
import { DomainEvent } from './DomainEvent.js';

export type EventHandler<E extends DomainEvent> = (event: E) => Promise<void>;

export class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  subscribe<E extends DomainEvent>(
    eventName: string,
    handler: EventHandler<E>
  ) {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  async publish(events: DomainEvent[]) {
    for (const event of events) {
      const handlers = this.handlers.get(event.name) ?? [];
      for (const handler of handlers) {
        await handler(event);
      }
    }
  }
}
