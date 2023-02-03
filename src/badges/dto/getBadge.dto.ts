import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetBadgeDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly User: number;

  @IsNumber()
  @IsNotEmpty()
  readonly Badges: number;
}