import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { TeamId } from '../value-objects/team-id';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';

export interface TeamVenue {
  name: string;
  city: string;
  capacity?: number;
}

export interface TeamProps {
  id: TeamId;
  externalId?: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  founded?: number;
  country?: string;
  venue?: TeamVenue;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class Team extends BaseEntity<TeamId> {
  private readonly _externalId?: string;
  private readonly _name: string;
  private readonly _shortName: string;
  private _logoUrl?: string;
  private readonly _founded?: number;
  private readonly _country?: string;
  private _venue?: TeamVenue;

  constructor(props: TeamProps) {
    super(props.id, props.createdAt, props.updatedAt);

    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Team name cannot be empty');
    }

    if (!props.shortName || props.shortName.trim().length === 0) {
      throw new Error('Team short name cannot be empty');
    }

    this._externalId = props.externalId;
    this._name = props.name.trim();
    this._shortName = props.shortName.trim();
    this._logoUrl = props.logoUrl;
    this._founded = props.founded;
    this._country = props.country;
    this._venue = props.venue;
  }

  get externalId(): string | undefined {
    return this._externalId;
  }

  get name(): string {
    return this._name;
  }

  get shortName(): string {
    return this._shortName;
  }

  get logoUrl(): string | undefined {
    return this._logoUrl;
  }

  get founded(): number | undefined {
    return this._founded;
  }

  get country(): string | undefined {
    return this._country;
  }

  get venue(): TeamVenue | undefined {
    return this._venue ? { ...this._venue } : undefined;
  }

  updateLogo(logoUrl: string): void {
    this._logoUrl = logoUrl;
    this.updateTimestamp();
  }

  updateVenue(venue?: TeamVenue): void {
    this._venue = venue ? { ...venue } : undefined;
    this.updateTimestamp();
  }
}