import {
    ArrayMinSize,
    IsNumber,
    IsDate,
    IsArray,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    isString,
  } from 'class-validator';

  export class CreateGoalDTO {
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
  }