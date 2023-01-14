import {
    IsNumber,
    IsNotEmpty,
  } from 'class-validator';

  export class AccessUserGoalDTO {
    @IsNumber()
    @IsNotEmpty()
    readonly userId: number;

    @IsNumber()
    @IsNotEmpty()
    readonly goalId: number;
  }