import { PickType } from '@nestjs/swagger/dist';
import { IsString, IsNotEmpty } from 'class-validator';
import { Users } from 'src/entity/users';

export class UpdatePinCodeDTO extends PickType(Users, ['pinCode']) {
  @IsString()
  @IsNotEmpty()
  readonly updatePinCode: string;
}
