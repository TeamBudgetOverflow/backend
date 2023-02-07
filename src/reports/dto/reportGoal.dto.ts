import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ReportGoalDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly Goal: number;

  @IsNumber()
  @IsNotEmpty()
  readonly User: number;

  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}
