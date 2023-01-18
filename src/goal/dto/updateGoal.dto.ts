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
} from 'class-validator';

export class UpdateGoalDTO {
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
  @ArrayMaxSize(10)
  readonly hashTag: string;

  // isAuto 와 isPrivate에 관한 사항 업데이트 시 추가 작성 필요
}
