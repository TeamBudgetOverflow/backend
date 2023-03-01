import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Reports } from 'src/entity/reports';

export class ReportGoalDTO extends PickType(Reports, ['reason']) {
  @IsNumber()
  @IsNotEmpty()
  readonly Goal: number;

  @IsNumber()
  @IsNotEmpty()
  readonly User: number;
}
