import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { createHash } from 'crypto';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const { authorization } = request.headers;
          const refreshToken = authorization;
          return refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    try {
      const { authorization } = request.headers;
      const refreshToken = authorization;
      const { pinCode } = request.body;

      const cryptoPinCode: string = createHash(
        this.configService.get<string>('ALGORITHM'),
      )
        .update(pinCode)
        .digest('base64');
      const { userId } = await this.authService.findUserByPinAndRefresh(
        refreshToken,
        cryptoPinCode,
      );
      return { userId, refreshToken };
    } catch (error) {
      console.log(error);
      throw new HttpException('pinCode가 잘못입력되었습니다', 401);
    }
  }
}
