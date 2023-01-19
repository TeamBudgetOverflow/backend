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

  @IsDate()
  @IsNotEmpty()
  readonly startDate: Date;

  @IsDate()
  @IsNotEmpty()
  readonly endDate: Date;

  @IsString()
  @IsArray()
  @ArrayMaxSize(10)
  readonly hashTag: string[];

  @IsString()
  @IsOptional()
  readonly emoji?: string;

  @IsNumber()
  @IsNotEmpty()
  readonly headCount: number;
}
