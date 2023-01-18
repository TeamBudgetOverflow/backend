import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class InitBalanceDTO {
  @IsNumber()
  readonly initial: number;

  @IsNumber()
  readonly current: number;

  @IsString()
  readonly chkType: string;
}