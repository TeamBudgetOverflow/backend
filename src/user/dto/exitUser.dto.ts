import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entity/users';

export class ExitUserDTO extends PickType(Users, [
  'email',
  'name',
  'nickname',
  'image',
  'loginCategory',
  'pinCode',
  'refreshToken',
  'description',
] as const) {}
