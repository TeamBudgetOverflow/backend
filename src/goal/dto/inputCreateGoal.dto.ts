import {
  ArrayMaxSize,
  IsNumber,
  IsBoolean,
  IsDate,
  IsArray,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  isString,
  IsOptional,
} from 'class-validator';

export class InputCreateGoalDTO {
  @IsBoolean()
  @IsOptional()
  readonly isPrivate?: boolean;

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
  @IsArray()
  @ArrayMaxSize(10)
  readonly hashTag: string[];

  @IsNumber()
  @IsNotEmpty()
  readonly accountId: number;

  @IsString()
  @IsOptional()
  readonly emoji?: string;
}
