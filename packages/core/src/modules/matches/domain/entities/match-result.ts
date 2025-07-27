export class MatchResult {
  constructor(
    public readonly homeScore: number,
    public readonly awayScore: number
  ) {
    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Scores cannot be negative');
    }
    
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      throw new Error('Scores must be integers');
    }
  }
  
  get totalGoals(): number {
    return this.homeScore + this.awayScore;
  }
  
  get homeWin(): boolean {
    return this.homeScore > this.awayScore;
  }
  
  get awayWin(): boolean {
    return this.awayScore > this.homeScore;
  }
  
  get draw(): boolean {
    return this.homeScore === this.awayScore;
  }
  
  get bothTeamsScored(): boolean {
    return this.homeScore > 0 && this.awayScore > 0;
  }
}