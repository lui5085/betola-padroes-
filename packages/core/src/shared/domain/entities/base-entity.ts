import { ID } from '../value-objects/id';
import { DateTime } from '../value-objects/date-time';

export abstract class BaseEntity<TID extends ID<any>> {
  private readonly _id: TID;
  private readonly _createdAt: DateTime;
  private _updatedAt: DateTime;
  
  constructor(id: TID, createdAt?: DateTime, updatedAt?: DateTime) {
    this._id = id;
    this._createdAt = createdAt || DateTime.now();
    this._updatedAt = updatedAt || DateTime.now();
  }
  
  get id(): TID {
    return this._id;
  }
  
  get createdAt(): DateTime {
    return this._createdAt;
  }
  
  get updatedAt(): DateTime {
    return this._updatedAt;
  }
  
  protected updateTimestamp(): void {
    this._updatedAt = DateTime.now();
  }
  
  equals(other: BaseEntity<TID>): boolean {
    return this._id.equals(other._id);
  }
}