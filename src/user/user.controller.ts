import * as dotenv from 'dotenv';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { NaverAuthGuard } from '../auth/naver/naver-auth.guard';
import { KakaoAuthGuard } from '../auth/kakao/kakao-auth.guard';
import {
  Controller,
  Get,
  Req,
  Request,
  Res,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Post, Patch, Put, Param, Body, Delete } from '@nestjs/common';
import { createHash } from 'crypto';
import { UpdatePinCodeDTO } from './dto/updatePinCode.dto';
import { ModifyUserInfoDTO } from './dto/modifyUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { BadgeService } from 'src/badges/badge.service';
import { GetBadgeDTO } from 'src/badges/dto/getBadge.dto';

dotenv.config();

@Controller('api/users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userGoalService: UserGoalService,
    private readonly badgeService: BadgeService,
  ) {}

  @Post('auth/naver')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(
    @Req() req,
    @Res() res: Response,
    @Query('code') code: string,
  ): Promise<any> {
    const user = await this.userService.findUserByEmail(req.user.email);
    if (user === null) {
      // 유저가 없을때 회원가입 -> 로그인
      const createUser = await this.userService.oauthCreateUser(req.user);
      const accessToken = await this.authService.createAccessToken(
        createUser,
      );
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '로그인 성공',
        newComer: true,
      });
    }
    // 유저가 있을때
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '로그인 성공',
      newComer: false,
    });
  }

  @UseGuards(KakaoAuthGuard)
  @Post('auth/kakao')
  
  async kakaoLoginCallback(
    @Req() req,
    @Res() res: Response,
    @Query('code') code: string,
  ): Promise<any> {
   
    const user = await this.userService.findUserByEmail(req.user.email);
    if (user === null) {
      // 유저가 없을때 회원가입 -> 로그인
      const createUser = await this.userService.oauthCreateUser(req.user);
      const accessToken = await this.authService.createAccessToken(
        createUser,
      );
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '로그인 성공',
        newComer: true,
      });
    }
    // 유저가 있을때
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '로그인 성공',
      newComer: false,
    });
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Req() req,
    @Res() res: Response){
        const userId: number = req.user;
        await this.authService.deleteRefreshToken(userId);
        res.json({ message: "로그아웃 성공" });
  }

  @Post(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async registerPinCode(
    @Param('userId') userId: number,
    @Body('pinCode') pinCode: string,
    @Req() req,
    @Res() res: Response,
  ) {
    if (userId != req.user) {
      throw new HttpException('허가되지 않은 접근입니다', 400);
    }
    const cryptoPinCode: string = createHash(process.env.ALGORITHM)
      .update(pinCode)
      .digest('base64');
    await this.userService.registerPinCode(userId, cryptoPinCode);
    res.json({ message: '핀 코드 등록 완료' });
  }

  @Put(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async updatePinCode(
    @Param('userId') userId: number,
    @Body() updatePinCodeDTO: UpdatePinCodeDTO,
    @Req() req,
    @Res() res: Response,
  ) {
    if (userId != req.user) {
      throw new HttpException('허가되지 않은 접근입니다', 400);
    }
    const cryptoPinCode: string = createHash(process.env.ALGORITHM)
      .update(updatePinCodeDTO.pinCode)
      .digest('base64');
    const findUser = await this.userService.findUserByUserId(userId);

    if (findUser.pinCode === cryptoPinCode) {
      const cryptoPinCode: string = createHash(process.env.ALGORITHM)
        .update(updatePinCodeDTO.updatePinCode)
        .digest('base64');
      await this.userService.registerPinCode(userId, cryptoPinCode);
      res.json({ message: '핀 코드 수정 완료' });
    } else {
      throw new HttpException('입력한 pinCode가 올바르지 않습니다', 400);
    }
  }

  // 리프레쉬 토큰을 이용한 엑세스 토큰 재발급하기
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('pinCode')
  async accessTokenReissue(
    @Body('pinCode') pinCode: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const accessToken = await this.authService.createAccessToken(req.user);
    return res.json({
      accessToken: 'Bearer ' + accessToken,
      message: 'accessToken 재발급',
    });
  }

  @Get('badges')
  @UseGuards(AuthGuard('jwt'))
  async getAllBadges(
    @Req() req,
    @Res() res: Response) {
      const getALLBadges = await this.badgeService.getALLBadges();
      res.json({ result : getALLBadges });
  }  
  
  @Get('badges/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getMyBadges(
    @Req() req,
    @Param('userId') userId: number,
    @Res() res: Response) {
      const findUserBadges = await this.badgeService.getUserBadges(userId);
      const result = [];
      for(let i=0; i<findUserBadges.length; i++) {
        result.push({
          Badges : findUserBadges[i].Badges
        })
      }
      res.json({ result : result });
  }

  @Get(':userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
  ) {
      const userId = req.user;
      // const user = 1;
      // if (Number(userId) !== user) {
      if (Number(targetUserId) === userId) {
        const targetUserProfile = await this.userService.getUserProfile(userId);
        return res.status(200).json(targetUserProfile);
      } else {
        throw new HttpException('User Does not exist', HttpStatus.BAD_REQUEST);
      }

      // else {
      //   return res.status(400).json({
      //     errorMessage: 'Not a valid user',
      //   });
      // }
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'))
  async modifyUserProfile(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
    @Body() modifyInfo: ModifyUserInfoDTO,
  ) {
    const userId = req.user;
    // const user = 1;
    // if (Number(userId) !== user) {
    if (Number(targetUserId) === userId) {
      await this.userService.modifyUser(userId, modifyInfo);
      res.json({
        message: 'Updated User Profile Succesfully',
      });
    } else {
      throw new HttpException('User Does not exist', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':userId/goals')
  @UseGuards(AuthGuard('jwt'))
  async getUserGoal(
    @Req() req,
    @Param('userId') userId: number,
    @Res() res: Response){
      const myUserId = req.user;
      const findGoals = await this.userGoalService.getGoalByUserId(userId);
      const result = [];
      for(let i = 0; i < findGoals.length; i++){
        if(myUserId != userId && (findGoals[i].goalId.isPrivate == true)){
          continue;
        } else {
          const hashTag = findGoals[i].goalId.hashTag.split(",");
          result.push({
            isPrivate: findGoals[i].goalId.isPrivate,
            goalId: findGoals[i].goalId.goalId,
            amount: findGoals[i].goalId.amount,
            curCount: findGoals[i].goalId.curCount,
            headCount: findGoals[i].goalId.headCount,
            startDate: findGoals[i].goalId.startDate,
            endDate: findGoals[i].goalId.endDate,
            title: findGoals[i].goalId.title,
            hashTag: hashTag,
            emoji: findGoals[i].goalId.emoji,
            description: findGoals[i].goalId.description,
            createdAt: findGoals[i].goalId.createdAt,
            updatedAt: findGoals[i].goalId.updatedAt,
            attainment: findGoals[i].balanceId.current/findGoals[i].goalId.amount * 100
          })
        }}
      res.json({ result: result });
  }

  

}
