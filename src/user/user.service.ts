import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { Users } from '../entity/users';
import { ExitUserDTO } from './dto/exitUser.dto';
import { ModifyUserInfoDTO } from './dto/modifyUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async login(user: Users) {
    const existUser = await this.findUserByEmailAndCategory(
      user.email,
      user.loginCategory,
    );
    if (existUser === null) {
      const createUser = await this.oauthCreateUser(user);
      const accessToken = await this.authService.createAccessToken(createUser);
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      return {
        accessToken,
        refreshToken,
        newComer: true,
        name: createUser.name,
      };
    } else {
      let isExistPinCode: Boolean;
      if (existUser.pinCode) isExistPinCode = true;
      else isExistPinCode = false;
      const accessToken = await this.authService.createAccessToken(existUser);
      const refreshToken = await this.authService.createRefreshToken(existUser);
      return {
        accessToken,
        refreshToken,
        newComer: false,
        name: existUser.name,
        isExistPinCode,
      };
    }
  }

  async findUserByEmailAndCategory(
    email: string,
    loginCategory: string,
  ): Promise<Users> {
    const option = {
      where: { email, loginCategory },
      offset: 0,
      limit: 1,
      raw: true, //조회한 결과 객체로만 표기 옵션
    };
    return this.userRepository.findOne(option);
  }

  findUserByUserId(userId: number): Promise<Users> {
    const option = {
      where: { userId },
      offset: 0,
      limit: 1,
      raw: true,
    };
    return this.userRepository.findOne(option);
  }

  oauthCreateUser(user: Users): Promise<Users> {
    return this.userRepository.save(user);
  }

  async createRefreshToken(userId: number, refreshToken: string) {
    await this.userRepository.update(userId, { refreshToken });
  }

  async registerPinCode(userId: number, pinCode: string) {
    console.log(pinCode);
    const cryptoPinCode: string = createHash(
      this.configService.get<string>('ALGORITHM'),
    )
      .update(pinCode)
      .digest('base64');
    await this.checkUpdate(userId, cryptoPinCode);
    await this.userRepository.update(userId, { pinCode: cryptoPinCode });
  }

  async checkUpdate(userId: number, pinCode: string) {
    const findUser = await this.findUserByUserId(userId);
    if (findUser.pinCode === pinCode) {
      throw new HttpException('기존 pinCode와 일치합니다', 400);
    }
  }

  async getUserProfile(userId: number) {
    const targetUserInfo = await this.userRepository
      .createQueryBuilder('u')
      .where('u.userId = :userId', { userId })
      .select([
        'u.email',
        'u.name',
        'u.nickname',
        'u.image',
        'u.loginCategory',
        'u.description',
      ])
      .getOne();
    return targetUserInfo;
  }

  async modifyUser(userId: number, modifyInfo: ModifyUserInfoDTO) {
    const targetUserInfo = await this.userRepository.findOneBy({ userId });
    const { nickname, image, description } = modifyInfo;

    targetUserInfo.nickname = nickname;
    targetUserInfo.image = image;
    targetUserInfo.description = description;
    await this.userRepository.save(targetUserInfo);
  }

  async exitUser(userId: number, data: ExitUserDTO) {
    await this.userRepository.update(userId, data);
  }
}
