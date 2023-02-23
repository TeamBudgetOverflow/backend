import { Strategy } from 'passport-kakao';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const email = profile._json.kakao_account.email; // account_email
    const name = profile.displayName;
    const nickname = profile._json.properties.nickname;
    const image = profile._json.properties.profile_image;
    const loginCategory = profile.provider;
    const payload = {
      email,
      name,
      nickname,
      image,
      loginCategory,
    };
    return payload;
  }
}
