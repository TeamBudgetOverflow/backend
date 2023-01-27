import {
  ArrayMaxSize,
  IsNumber,
  IsDate,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  isString,
  IsOptional,
} from 'class-validator';

export class CreateGoalDTO {
  @IsBoolean()
  @IsOptional()
  readonly isPrivate?: boolean;

  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly curCount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @IsDate()
  @IsNotEmpty()
  readonly startDate: Date;

  @IsDate()
  @IsNotEmpty()
  readonly endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly period: number;

  @IsString()
  @IsNotEmpty()
  readonly status: string;

  @IsNumber()
  @IsNotEmpty()
  readonly headCount: number;

  @IsString()
  @MinLength(4)
  @MaxLength(25, {
    message: 'The maximum length of the title is 25',
  })
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @MaxLength(255, {
    message: 'The maximum length of the content is 255',
  })
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @ArrayMaxSize(10)
  readonly hashTag: string;

  @IsString()
  @IsOptional()
  readonly emoji?: string;
}
