import * as dotenv from 'dotenv';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { NaverStrategy } from './naver/naver.strategy';
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
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: `${process.env.ACCESS_TOKEN_EXP}` },
    }),
    JwtModule.register({
      secret: process.env.REFRESH_TOKEN_KEY,
      signOptions: { expiresIn: `${process.env.REFRESH_TOKEN_EXP}` },
    }),
    ],
  exports: [JwtModule],
  providers: [AuthService, UserService, JwtService, NaverStrategy,
  JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
