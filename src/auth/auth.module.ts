import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { NaverStrategy } from './naver/naver.strategy';
import { GoogleOauthStrategy } from './google/google.strategy';
import { KakaoStrategy } from './kakao/kakao.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtRefreshStrategy } from './jwt/jwt-refresh.strategy';
import { UserModule } from '../user/user.module';
import { Users } from 'src/models/users';

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
