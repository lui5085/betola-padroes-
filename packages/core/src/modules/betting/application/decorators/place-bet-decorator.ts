import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { PlaceBetRequest, PlaceBetResponse } from '../use-cases/place-bet';

export abstract class PlaceBetDecorator
  implements UseCase<PlaceBetRequest, PlaceBetResponse>
{
  constructor(
    protected readonly wrapped: UseCase<PlaceBetRequest, PlaceBetResponse>,
  ) {}

  abstract execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>>;
}
