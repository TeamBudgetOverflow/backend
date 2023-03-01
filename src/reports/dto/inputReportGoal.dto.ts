import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Reports } from 'src/entity/reports';

export class InputReportGoalDTO extends PickType(Reports, ['reason']) {
  @IsNumber()
  @IsNotEmpty()
  readonly goalId: number;
}
