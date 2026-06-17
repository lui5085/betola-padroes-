import { DomainEvent } from './domain-event';
import { EventObserver } from './observers/event-observer';

export interface EventBus {
  publish(event: DomainEvent): void;
  subscribe(eventType: string, observer: EventObserver): void;
  unsubscribe(eventType: string, observer: EventObserver): void;
}
