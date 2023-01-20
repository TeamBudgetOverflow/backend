
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
            const { authorization } = request.headers;
            const accessToken = authorization.split(' ')[1];
            return accessToken;
          },
      ]),
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const existUser = await this.userService.findUserByUserId(payload.userId);

    if (!existUser) {
      throw new UnauthorizedException('회원정보가 존재하지 않습니다.');
    }

    return payload.userId;
  }
}