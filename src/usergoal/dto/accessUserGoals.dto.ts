import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class AccessUserGoalDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  readonly goalId?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  readonly balanceId?: number;
}
