import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { NaverAuthGuard } from '../auth/guard/naver-auth.guard';
import {
  Controller,
  Get,
  Req,
  Request,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
//import { JwtRefreshGuard } from 'src/auth/guard/jwt-refreshToken-auth.guard';
import { Post } from '@nestjs/common';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    ) {}

  // naver login
  @Get('/auth/naver')
  @HttpCode(200)
  @UseGuards(NaverAuthGuard)
  async NaverLogin() {
    return HttpStatus.OK;
  }

  // naver callback
  @Get('auth/naver/callback')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(@Req() req, @Res() res: Response)
  {
        const user = await this.userService.findUserByEmail(req.user.email);
        if (user === null) {
        // 유저가 없을때 회원가입 -> 로그인
          const createUser = await this.userService.oauthCreateUser(req.user);
          console.log(createUser);
          const accessToken = await this.authService.createAccessToken(createUser);
          const refreshToken = await this.authService.createRefreshToken(createUser);
          return res
            .status(201)
            .json({ accessToken, refreshToken, message: "로그인 성공" });
        }
        // 유저가 있을때
        const accessToken = await this.authService.createAccessToken(user);
        const refreshToken = await this.authService.createRefreshToken(user);
        return res
            .status(201)
            .json({ accessToken, refreshToken, message: "로그인 성공" });
  }

  // 리프레쉬 토큰을 이용한 엑세스 토큰 재발급하기
//   @UseGuards(JwtRefreshGuard)
//   @Get('auth/refresh-accesstoken')
//   async refreshAccessToken() {
//     return { success: true, message: 'new accessToken Issuance success' };
//   }
}