import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { MatchId } from '../value-objects/match-id';
import { TeamId } from '../value-objects/team-id';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';
import { MatchStatus, MatchStatusVO } from '../value-objects/match-status';
import { MatchResult } from './match-result';

export interface MatchProps {
  id: MatchId;
  externalId?: string;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  kickoffTime: DateTime;
  status?: MatchStatusVO;
  homeScore?: number;
  awayScore?: number;
  round: number;
  season: string;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class Match extends BaseEntity<MatchId> {
  private readonly _externalId?: string;
  private readonly _homeTeamId: TeamId;
  private readonly _awayTeamId: TeamId;
  private readonly _kickoffTime: DateTime;
  private _status: MatchStatusVO;
  private _homeScore?: number;
  private _awayScore?: number;
  private readonly _round: number;
  private readonly _season: string;
  
  constructor(props: MatchProps) {
    super(props.id, props.createdAt, props.updatedAt);
    
    this._externalId = props.externalId;
    this._homeTeamId = props.homeTeamId;
    this._awayTeamId = props.awayTeamId;
    this._kickoffTime = props.kickoffTime;
    this._status = props.status || new MatchStatusVO(MatchStatus.SCHEDULED);
    this._homeScore = props.homeScore;
    this._awayScore = props.awayScore;
    this._round = props.round;
    this._season = props.season;
  }
  
  get externalId(): string | undefined {
    return this._externalId;
  }
  
  get homeTeamId(): TeamId {
    return this._homeTeamId;
  }
  
  get awayTeamId(): TeamId {
    return this._awayTeamId;
  }
  
  get kickoffTime(): DateTime {
    return this._kickoffTime;
  }
  
  get status(): MatchStatusVO {
    return this._status;
  }
  
  get homeScore(): number | undefined {
    return this._homeScore;
  }
  
  get awayScore(): number | undefined {
    return this._awayScore;
  }
  
  get round(): number {
    return this._round;
  }
  
  get season(): string {
    return this._season;
  }
  
  isAvailableForBetting(): boolean {
    if (!this._status.isScheduled()) {
      return false;
    }
    
    // Check if kickoff is at least 5 minutes in the future
    const fiveMinutesFromNow = DateTime.now().addMinutes(5);
    return this._kickoffTime.isAfter(fiveMinutesFromNow);
  }
  
  isFinished(): boolean {
    return this._status.isFinished();
  }
  
  getResult(): MatchResult | null {
    if (!this.isFinished() || this._homeScore === undefined || this._awayScore === undefined) {
      return null;
    }
    
    return new MatchResult(this._homeScore, this._awayScore);
  }
  
  updateScore(homeScore: number, awayScore: number): void {
    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Scores cannot be negative');
    }
    
    this._homeScore = homeScore;
    this._awayScore = awayScore;
    this.updateTimestamp();
  }
  
  markAsFinished(): void {
    if (this._homeScore === undefined || this._awayScore === undefined) {
      throw new Error('Cannot finish match without scores');
    }
    
    this._status = new MatchStatusVO(MatchStatus.FINISHED);
    this.updateTimestamp();
  }
  
  markAsLive(): void {
    if (!this._status.isScheduled()) {
      throw new Error('Can only mark scheduled matches as live');
    }
    
    this._status = new MatchStatusVO(MatchStatus.LIVE);
    this.updateTimestamp();
  }
  
  postpone(): void {
    if (this._status.isFinished() || this._status.isLive()) {
      throw new Error('Cannot postpone finished or live matches');
    }
    
    this._status = new MatchStatusVO(MatchStatus.POSTPONED);
    this.updateTimestamp();
  }
}