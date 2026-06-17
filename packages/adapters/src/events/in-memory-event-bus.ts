import { EventBus } from '@betola/core/shared/domain/events/event-bus';
import { DomainEvent } from '@betola/core/shared/domain/events/domain-event';
import { EventObserver } from '@betola/core/shared/domain/events/observers/event-observer';

export class InMemoryEventBus implements EventBus {
  private observers: Map<string, EventObserver[]> = new Map();

  subscribe(eventType: string, observer: EventObserver): void {
    const existing = this.observers.get(eventType) || [];
    existing.push(observer);
    this.observers.set(eventType, existing);
  }

  unsubscribe(eventType: string, observer: EventObserver): void {
    const existing = this.observers.get(eventType) || [];
    this.observers.set(
      eventType,
      existing.filter(o => o !== observer),
    );
  }

  publish(event: DomainEvent): void {
    const observers = this.observers.get(event.type) || [];
    for (const observer of observers) {
      observer.handle(event).catch(err => {
        console.error(`[EventBus] Observer failed for event ${event.type}:`, err.message);
      });
    }
  }
}
