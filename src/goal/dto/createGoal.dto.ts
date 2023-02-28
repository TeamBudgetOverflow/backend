import { PickType } from '@nestjs/swagger/dist/type-helpers';
import { IsNumber, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { Goals } from 'src/entity/goals';

export class CreateGoalDTO extends PickType(Goals, [
  'curCount',
  'amount',
  'startDate',
  'endDate',
  'period',
  'status',
  'headCount',
  'title',
  'description',
  'hashTag',
]) {
  @IsBoolean()
  @IsOptional()
  readonly isPrivate?: boolean;

  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsOptional()
  readonly emoji?: string;
}
