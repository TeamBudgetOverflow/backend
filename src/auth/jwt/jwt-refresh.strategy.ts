import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { createHash } from 'crypto';
import { HttpException } from '@nestjs/common';

dotenv.config();

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private authService: AuthService) {
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
            (request: any) => {
              const { authorization } = request.headers;
              const refreshToken = authorization;
              return refreshToken;
            },
          ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    try{
      const { authorization } = request.headers;
      const refreshToken = authorization;
      const { pinCode } = request.body;

      const cryptoPinCode: string = createHash(process.env.ALGORITHM)
          .update(pinCode)
          .digest('base64');
      const { userId } = await this.authService.findUserByPinAndRefresh(
        refreshToken, cryptoPinCode
      );
      return { userId, refreshToken };
    }catch(error){
      console.log(error);
      throw new HttpException('pinCode가 잘못입력되었습니다', 401);
    }
  }
}