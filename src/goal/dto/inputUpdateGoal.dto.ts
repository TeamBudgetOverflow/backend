import { PickType } from '@nestjs/swagger/dist/type-helpers';
import {
  ArrayMaxSize,
  IsNumber,
  IsArray,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Goals } from 'src/entity/goals';

export class InputUpdateGoalDTO extends PickType(Goals, [
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

  @IsArray()
  @ArrayMaxSize(10)
  readonly hashTag: string[];

  @IsString()
  @IsOptional()
  readonly emoji?: string;

  @IsBoolean()
  readonly isManual: boolean;

  @IsNumber()
  readonly accountId: number;
}
