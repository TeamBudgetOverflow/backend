import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class InputReportGoalDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly goalId: number;

  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}
