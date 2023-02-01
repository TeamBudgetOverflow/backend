import * as dotenv from 'dotenv';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { NaverStrategy } from './naver/naver.strategy';
import { GoogleOauthStrategy } from './google/google.strategy';
import { KakaoStrategy } from './kakao/kakao.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtRefreshStrategy } from './jwt/jwt-refresh.strategy';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/models/users';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    forwardRef(() => UserModule),
    JwtModule,
  ],
  providers: [
    AuthService,
    JwtService,
    NaverStrategy,
    KakaoStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleOauthStrategy,
  ],
  exports: [
    AuthService,
    JwtService,
    NaverStrategy,
    KakaoStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleOauthStrategy,
  ],
})
export class AuthModule {}
