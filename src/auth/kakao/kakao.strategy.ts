import { Strategy } from "passport-kakao"; 
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from '@nestjs/common';
import { AuthService } from "../auth.service";


@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
   constructor(private authService: AuthService){
    super({

      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,

    });
  }

  
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
   ): Promise<any> {
    const user_email = profile._json.email;
    const user_name = profile.displayName;
    const user_nickname = profile._json.nickname;
    const user_image = profile._json.profile_image;
    const user_loginCategory = profile.provider;
    const user_profile = {
      user_email,
      user_name,
      user_nickname,
      user_image,
      user_loginCategory,
    };

    done(null, user_profile); 
  

  }
}

