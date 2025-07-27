export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: string
  ) {}
  
  static success<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }
  
  static failure<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }
  
  isSuccess(): boolean {
    return this._isSuccess;
  }
  
  isFailure(): boolean {
    return !this._isSuccess;
  }
  
  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }
  
  get error(): string {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }
}