import { Result } from '../../../../shared/application/result';

export interface BetValidationContext {
  userId: string;
  amount: number;
  selections: {
    matchId: string;
    marketType: string;
    selection: string;
    odds: number;
  }[];
}

export abstract class BetValidationHandler {
  private nextHandler: BetValidationHandler | null = null;

  setNext(handler: BetValidationHandler): BetValidationHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(context: BetValidationContext): Promise<Result<void>> {
    const result = await this.validate(context);
    if (result.isFailure()) {
      return result;
    }
    if (this.nextHandler) {
      return this.nextHandler.handle(context);
    }
    return Result.success(undefined);
  }

  protected abstract validate(context: BetValidationContext): Promise<Result<void>>;
}
