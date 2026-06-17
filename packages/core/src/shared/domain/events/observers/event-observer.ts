import { DomainEvent } from '../domain-event';

export interface EventObserver {
  handle(event: DomainEvent): Promise<void>;
}
