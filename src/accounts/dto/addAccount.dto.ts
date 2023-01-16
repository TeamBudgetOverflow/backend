import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class AddAccountDto {
  @IsString()
  @IsOptional()
  readonly bankUserId: string;

  @IsString()
  @IsOptional()
  readonly bankUserPw: string;

  @IsString()
  @IsOptional()
  readonly acctNo: string;

  @IsString()
  @IsOptional()
  readonly acctPw: string;

  @IsNumber()
  @IsNotEmpty()
  readonly bankId: number;
}
