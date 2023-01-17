import {
    IsString,
    IsNotEmpty,
  } from 'class-validator';

  export class UpdatePinCodeDTO {
    @IsString()
    @IsNotEmpty()
    readonly pinCode: string;

    @IsString()
    @IsNotEmpty()
    readonly updatePinCode: string;
  }