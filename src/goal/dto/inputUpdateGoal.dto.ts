import {
  ArrayMaxSize,
  IsNumber,
  IsDate,
  IsArray,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  isString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class InputUpdateGoalDTO {
  @IsBoolean()
  @IsOptional()
  readonly isPrivate?: boolean;

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

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  readonly startDate: string;

  @IsString()
  @IsNotEmpty()
  readonly endDate: string;

  @IsArray()
  @ArrayMaxSize(10)
  readonly hashTag: string[];

  @IsString()
  @IsOptional()
  readonly emoji?: string;

  @IsNumber()
  @IsNotEmpty()
  readonly headCount: number;

  @IsBoolean()
  readonly isManual: boolean;

  @IsNumber()
  readonly accountId: number;
}
