import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetBadgeDTO {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly badgeId: number;
}