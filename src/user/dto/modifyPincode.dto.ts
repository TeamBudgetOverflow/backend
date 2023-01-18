import { IsNotEmpty, IsString } from 'class-validator';

export class ModifyPincodeDTO {
  @IsString()
  @IsNotEmpty()
  readonly pinCode: string;

  @IsString()
  @IsNotEmpty()
  readonly updatePinCode: string;
}
