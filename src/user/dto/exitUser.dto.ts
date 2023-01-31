import { IsNotEmpty, IsString } from 'class-validator';

export class ExitUserDTO {
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  readonly image: string;

  @IsString()
  @IsNotEmpty()
  readonly loginCateGory: string;

  @IsString()
  @IsNotEmpty()
  readonly pinCode: string;

  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
