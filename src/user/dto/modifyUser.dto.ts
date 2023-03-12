import { PickType } from '@nestjs/swagger/dist';
import { Users } from 'src/entity/users';
export class ModifyUserInfoDTO extends PickType(Users, [
  'nickname',
  'image',
  'description',
]) {}
