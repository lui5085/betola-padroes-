export enum MarketType {
  MATCH_WINNER = 'MATCH_WINNER',
  BOTH_TEAMS_SCORE = 'BOTH_TEAMS_SCORE',
  OVER_UNDER_GOALS = 'OVER_UNDER_GOALS',
  ASIAN_HANDICAP = 'ASIAN_HANDICAP',
  CORRECT_SCORE = 'CORRECT_SCORE',
  FIRST_HALF_RESULT = 'FIRST_HALF_RESULT',
  DOUBLE_CHANCE = 'DOUBLE_CHANCE',
  TOTAL_GOALS = 'TOTAL_GOALS',
  ODD_EVEN_GOALS = 'ODD_EVEN_GOALS',
  HALF_TIME_FULL_TIME = 'HALF_TIME_FULL_TIME'
}

export class MarketTypeVO {
  constructor(private readonly _value: MarketType) {}

  get value(): MarketType {
    return this._value;
  }

  get displayName(): string {
    const names: Record<MarketType, string> = {
      [MarketType.MATCH_WINNER]: 'Resultado Final',
      [MarketType.BOTH_TEAMS_SCORE]: 'Ambos Marcam',
      [MarketType.OVER_UNDER_GOALS]: 'Acima/Abaixo de Gols',
      [MarketType.ASIAN_HANDICAP]: 'Handicap Asiático',
      [MarketType.CORRECT_SCORE]: 'Placar Correto',
      [MarketType.FIRST_HALF_RESULT]: 'Resultado 1º Tempo',
      [MarketType.DOUBLE_CHANCE]: 'Dupla Chance',
      [MarketType.TOTAL_GOALS]: 'Total de Gols',
      [MarketType.ODD_EVEN_GOALS]: 'Par/Ímpar',
      [MarketType.HALF_TIME_FULL_TIME]: 'Intervalo/Final'
    };

    return names[this._value];
  }

  get code(): string {
    const codes: Record<MarketType, string> = {
      [MarketType.MATCH_WINNER]: '1X2',
      [MarketType.BOTH_TEAMS_SCORE]: 'BTTS',
      [MarketType.OVER_UNDER_GOALS]: 'OU',
      [MarketType.ASIAN_HANDICAP]: 'AH',
      [MarketType.CORRECT_SCORE]: 'CS',
      [MarketType.FIRST_HALF_RESULT]: '1H',
      [MarketType.DOUBLE_CHANCE]: 'DC',
      [MarketType.TOTAL_GOALS]: 'TG',
      [MarketType.ODD_EVEN_GOALS]: 'OE',
      [MarketType.HALF_TIME_FULL_TIME]: 'HT/FT'
    };

    return codes[this._value];
  }

  isBinary(): boolean {
    return [
      MarketType.BOTH_TEAMS_SCORE,
      MarketType.ODD_EVEN_GOALS
    ].includes(this._value);
  }

  isHandicap(): boolean {
    return this._value === MarketType.ASIAN_HANDICAP;
  }

  isOverUnder(): boolean {
    return this._value === MarketType.OVER_UNDER_GOALS;
  }

  equals(other: MarketTypeVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}