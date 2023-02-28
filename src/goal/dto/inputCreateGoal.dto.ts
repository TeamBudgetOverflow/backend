import { PickType } from '@nestjs/swagger/dist/type-helpers';
import {
  ArrayMaxSize,
  IsNumber,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Goals } from 'src/entity/goals';

export class InputCreateGoalDTO extends PickType(Goals, [
  'amount',
  'startDate',
  'endDate',
  'headCount',
  'title',
  'description',
]) {
  @IsBoolean()
  @IsOptional()
  readonly isPrivate?: boolean;

  @IsArray()
  @ArrayMaxSize(10)
  readonly hashTag: string[];

  @IsNumber()
  @IsNotEmpty()
  readonly accountId: number;

  @IsString()
  @IsOptional()
  readonly emoji?: string;

  @IsBoolean()
  readonly isManual: boolean;
}
