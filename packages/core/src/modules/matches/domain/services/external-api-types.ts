export interface ExternalOddsResponse {
    rodada: ExternalMatch[];
  }
  
  export interface ExternalMatch {
    mandante: string;
    visitante: string;
    odds: ExternalOdds;
  }
  
  export interface ExternalOdds {
    "resultado final": {
      casa: number;
      empate: number;
      fora: number;
    };
    "chance_dupla": {
      "12": number;
      "1X": number;
      "X2": number;
    };
    "ambos_marcam": {
      sim: number;
      nao: number;
    };
    "primeiro_a_marcar": {
      casa: number;
      sem_gol: number;
      fora: number;
    };
    "empate_nao_tem_aposta": {
      casa: number;
      fora: number;
    };
    "resultado_primeiro_tempo": {
      casa: number;
      empate: number;
      fora: number;
    };
    "resultado_segundo_tempo": {
      casa: number;
      empate: number;
      fora: number;
    };
    "total_de_gols": {
      [key: string]: {
        menos: number;
        mais: number;
      };
    };
  }
  
  // API-Football types for match results
  export interface FootballApiResponse {
    response: FootballApiMatch[];
  }
  
  export interface FootballApiMatch {
    fixture: {
      id: number;
      date: string;
      status: {
        long: string;
        short: string;
      };
    };
    teams: {
      home: {
        id: number;
        name: string;
      };
      away: {
        id: number;
        name: string;
      };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
    score: {
      fulltime: {
        home: number | null;
        away: number | null;
      };
    };
  }