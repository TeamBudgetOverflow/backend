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
    
    //const user_email = emails[0].value,
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

  

    done(null, payload); 
  

  }
}

