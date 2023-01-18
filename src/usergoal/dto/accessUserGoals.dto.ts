import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class AccessUserGoalDTO {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  readonly userId?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  readonly goalId?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  readonly balanceId?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  readonly accountId?: number;
}
