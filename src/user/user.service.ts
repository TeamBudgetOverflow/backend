import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../models/users';
import { ModifyUserInfoDTO } from './dto/modifyUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}
  findUserByEmail(email: string): Promise<Users> {
    const option = {
      where: { email },
      offset: 0,
      limit: 1,
      raw: true, //조회한 결과 객체로만 표기 옵션
    };
    return this.userRepository.findOne(option);
  }

  findUserByEmailAndCategory(
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
    const findUserUpdate = await this.userRepository.findOneBy({ userId });
    findUserUpdate.refreshToken = refreshToken;
    await this.userRepository.save(findUserUpdate);
  }

  async registerPinCode(userId: number, cryptoPinCode: string) {
    const findUserUpdate = await this.userRepository.findOneBy({ userId });
    findUserUpdate.pinCode = cryptoPinCode;
    await this.userRepository.save(findUserUpdate);
  }

  async getUserProfile(userId: number) {
    const targetUserInfo = await this.userRepository
      .createQueryBuilder('u')
      .where('u.userId = :userId', {userId})
      .select(['u.email', 'u.name', 'u.nickname',
      'u.image', 'u.loginCategory', 'u.description'])
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
}
