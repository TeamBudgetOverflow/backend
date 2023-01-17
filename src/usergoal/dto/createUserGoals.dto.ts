import {
    IsNumber,
    IsNotEmpty,
  } from 'class-validator';

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
  }