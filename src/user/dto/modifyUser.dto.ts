import { IsNotEmpty, IsString } from 'class-validator';

export class ModifyUserInfoDTO {
  @IsString()
  @IsNotEmpty()
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  readonly image: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
