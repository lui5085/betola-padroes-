export enum WalletTransactionType {
  BET_PLACED = 'BET_PLACED',
  BET_WINNINGS = 'BET_WINNINGS',
  BET_REFUND = 'BET_REFUND',
  BONUS = 'BONUS',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT'
}

export class WalletTransactionTypeVO {
  private readonly _value: WalletTransactionType;

  constructor(value: WalletTransactionType | string) {
    if (typeof value === 'string') {
      if (!Object.values(WalletTransactionType).includes(value as WalletTransactionType)) {
        throw new Error(`Invalid transaction type: ${value}`);
      }
      this._value = value as WalletTransactionType;
    } else {
      this._value = value;
    }
  }

  get value(): WalletTransactionType {
    return this._value;
  }

  equals(other: WalletTransactionTypeVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static BET_PLACED(): WalletTransactionTypeVO {
    return new WalletTransactionTypeVO(WalletTransactionType.BET_PLACED);
  }

  static BET_WINNINGS(): WalletTransactionTypeVO {
    return new WalletTransactionTypeVO(WalletTransactionType.BET_WINNINGS);
  }

  static BET_REFUND(): WalletTransactionTypeVO {
    return new WalletTransactionTypeVO(WalletTransactionType.BET_REFUND);
  }

  static BONUS(): WalletTransactionTypeVO {
    return new WalletTransactionTypeVO(WalletTransactionType.BONUS);
  }

  static ADMIN_ADJUSTMENT(): WalletTransactionTypeVO {
    return new WalletTransactionTypeVO(WalletTransactionType.ADMIN_ADJUSTMENT);
  }
}