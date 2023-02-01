import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserGoalDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly goalId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly accountId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly balanceId: number;

  @IsString()
  @IsNotEmpty()
  readonly status: string;
}
