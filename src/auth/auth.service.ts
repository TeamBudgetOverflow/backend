import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Users } from '../models/users';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(user_email: string): Promise<any> {
    const user = await this.userService.findUserByEmail(user_email);
    if (!user) {
      return null;
    }
    return user;
  }

  async tokenValidate(token: string) {
    return await this.jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_KEY,
    });
  }

  async createAccessToken(user: Users) {
    const payload = {
      userId: user.userId,
    };
    const accessToken: string = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: `${process.env.ACCESS_TOKEN_EXP}`,
    });
    return accessToken;
  }

  async createRefreshToken(user: Users): Promise<string> {
    const refreshToken: string = this.jwtService
      .sign({}, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: `${process.env.REFRESH_TOKEN_EXP}`,
      });

    this.userService.createRefreshToken(user.userId, refreshToken);
    return refreshToken;
  }

  async findUserByPinAndRefresh(
    refreshToken: string,
    pinCode: string,
  ): Promise<Users> {
    return await this.userRepository.findOneBy({ refreshToken, pinCode });
  }

}
