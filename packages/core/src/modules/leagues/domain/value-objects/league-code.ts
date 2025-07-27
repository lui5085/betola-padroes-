export class LeagueCode {
  private static readonly CODE_LENGTH = 6;
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  constructor(private readonly _value: string) {
    if (!this.isValid(_value)) {
      throw new Error('Invalid league code format');
    }
  }
  
  static generate(): LeagueCode {
    let code = '';
    for (let i = 0; i < LeagueCode.CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * LeagueCode.CHARACTERS.length);
      code += LeagueCode.CHARACTERS[randomIndex];
    }
    return new LeagueCode(code);
  }
  
  private isValid(value: string): boolean {
    return /^[A-Z0-9]{6}$/.test(value);
  }
  
  get value(): string {
    return this._value;
  }
  
  equals(other: LeagueCode): boolean {
    return this._value === other._value;
  }
  
  toString(): string {
    return this._value;
  }
}