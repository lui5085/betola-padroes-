export interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
  readonly payload: Record<string, any>;
}
