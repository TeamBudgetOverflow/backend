import { PickType } from '@nestjs/swagger/dist/type-helpers';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Goals } from 'src/entity/goals';

export class UpdateGoalDTO extends PickType(Goals, [
  'title',
  'description',
  'amount',
  'startDate',
  'endDate',
  'headCount',
]) {
  @IsBoolean()
  @IsOptional()
  readonly isPrivate?: boolean;

  @IsDate()
  @IsNotEmpty()
  readonly endDate: Date;

  @IsString()
  readonly hashTag: string;

  @IsString()
  @IsOptional()
  readonly emoji?: string;
}
