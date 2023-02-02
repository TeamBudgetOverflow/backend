import * as dotenv from 'dotenv';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { NaverAuthGuard } from '../auth/naver/naver-auth.guard';
import { KakaoAuthGuard } from '../auth/kakao/kakao-auth.guard';
import { GoogleOauthGuard } from '../auth/google/google-oauth.guard';
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
import { GoalService } from 'src/goal/goal.service';
import { BadgeService } from 'src/badges/badge.service';
import { GetBadgeDTO } from 'src/badges/dto/getBadge.dto';
import { ExitUserDTO } from './dto/exitUser.dto';
import { AccessUserGoalDTO } from 'src/usergoal/dto/accessUserGoals.dto';
import { BalanceService } from 'src/balances/balances.service';

dotenv.config();

@Controller('api/users')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly goalService: GoalService,
    private readonly userGoalService: UserGoalService,
    private readonly balanceService: BalanceService,
    private readonly badgeService: BadgeService,
  ) {}

  @Post('auth/google')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Res() res: Response,
    @Query('code') code: string,
  ): Promise<any> {
    console.log(req.user);
    const user = await this.userService.findUserByEmailAndCategory(
      req.user.email,
      req.user.loginCategory,
    );
    if (user === null) {
      const createUser = await this.userService.oauthCreateUser(req.user);
      const accessToken = await this.authService.createAccessToken(createUser);
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      return res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: 'Google OAuth Completed - Incoming User',
        newComer: true,
        name: createUser.name,
      });
    }
    // 유저가 있을때
    let isExistPinCode: Boolean;
    if(user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: 'Google OAuth Completed - Returning User',
      newComer: false,
      name: user.name,
      isExistPinCode
    });
  }

  @Post('auth/naver')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(
    @Req() req,
    @Res() res: Response,
    @Query('code') code: string,
  ): Promise<any> {
    console.log(req.user);
    const user = await this.userService.findUserByEmailAndCategory(
      req.user.email,
      req.user.loginCategory,
    );
    if (user === null) {
      // 유저가 없을때 회원가입 -> 로그인
      const createUser = await this.userService.oauthCreateUser(req.user);
      // console.log(createUser)
      const accessToken = await this.authService.createAccessToken(createUser);
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      return res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '로그인 성공',
        newComer: true,
        name: createUser.name,
      });
    }
    // 유저가 있을때
    let isExistPinCode: Boolean;
    if(user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '로그인 성공',
      newComer: false,
      name: user.name,
      isExistPinCode,
    });
  }

  @UseGuards(KakaoAuthGuard)
  @Post('auth/kakao')
  async kakaoLoginCallback(
    @Req() req,
    @Res() res: Response,
    @Query('code') code: string,
  ): Promise<any> {
    const user = await this.userService.findUserByEmailAndCategory(
      req.user.email,
      req.user.loginCategory,
    );
    if (user === null) {
      // 유저가 없을때 회원가입 -> 로그인
      const createUser = await this.userService.oauthCreateUser(req.user);
      const accessToken = await this.authService.createAccessToken(createUser);
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      return res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '로그인 성공',
        newComer: true,
        name: createUser.name,
      });
    }
    // 유저가 있을때
    let isExistPinCode: Boolean;
    if(user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '로그인 성공',
      newComer: false,
      name: user.name,
      isExistPinCode,
    });
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req, @Res() res: Response) {
    const userId: number = req.user;
    await this.authService.deleteRefreshToken(userId);
    res.json({ message: '로그아웃 성공' });
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
  async getAllBadges(@Req() req, @Res() res: Response) {
    const getALLBadges = await this.badgeService.getALLBadges();
    res.json({ result: getALLBadges });
  }

  @Get('badges/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getMyBadges(
    @Req() req,
    @Param('userId') userId: number,
    @Res() res: Response,
  ) {
    const findUserBadges = await this.badgeService.getUserBadges(userId);
    const result = [];
    for (let i = 0; i < findUserBadges.length; i++) {
      result.push({
        Badges: findUserBadges[i].Badges.badgeId,
      });
    }
    res.json({ result: result });
  }

  @Get(':userId')
  async getUserProfile(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
  ) {
    const targetUserProfile = await this.userService.getUserProfile(
      Number(targetUserId),
    );
    if (targetUserProfile) {
      return res.json(targetUserProfile);
    } else {
      throw new HttpException('User Does not exist', HttpStatus.BAD_REQUEST);
    }
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
    @Res() res: Response,
  ) {
    const myUserId = req.user;
    const findGoals = await this.userGoalService.getGoalByUserId(userId);
    const result = [];
    for (let i = 0; i < findGoals.length; i++) {
      if (myUserId != userId && findGoals[i].goalId.isPrivate == true) {
        continue;
      } else {
        const hashTag = findGoals[i].goalId.hashTag.split(',');
        result.push({
          isPrivate: findGoals[i].goalId.isPrivate,
          goalId: findGoals[i].goalId.goalId,
          amount: findGoals[i].goalId.amount,
          curCount: findGoals[i].goalId.curCount,
          headCount: findGoals[i].goalId.headCount,
          startDate: findGoals[i].goalId.startDate,
          endDate: findGoals[i].goalId.endDate,
          period: findGoals[i].goalId.period,
          status: findGoals[i].goalId.status,
          title: findGoals[i].goalId.title,
          hashTag: hashTag,
          emoji: findGoals[i].goalId.emoji,
          description: findGoals[i].goalId.description,
          createdAt: findGoals[i].goalId.createdAt,
          updatedAt: findGoals[i].goalId.updatedAt,
          attainment:
            (findGoals[i].balanceId.current / findGoals[i].goalId.amount) * 100,
        });
      }
    }
    res.json({ result: result });
  }

  // 회원 탈퇴
  @Delete('exit/:userId')
  @UseGuards(AuthGuard('jwt'))
  async exitUsesr(
    @Req() req,
    @Param('userId') userId: number,
    @Res() res: Response){
        if(req.user !== Number(userId)){
          throw new HttpException(
            '권한이 없는 호출입니다.', 
            HttpStatus.BAD_REQUEST
            );
        }
        const data: ExitUserDTO = {
          email: "Exit User", // 현재 협의가 필요
          name: "탈퇴한 사용자",
          nickname: "탈퇴한 사용자",
          image: null,
          loginCategory: null,
          pinCode: null,
          refreshToken: null,
          description: null
        }
        // 1. 회원 정보 빈 값 처리
        await this.userService.exitUser(userId, data);
        const getGoal = await this.userGoalService.getGoalByUserId(userId);
        for(let i = 0; i < getGoal.length; i++) {
          let goalId: number = getGoal[i].goalId.goalId;
          let accessUserGoalData: AccessUserGoalDTO = {
            userId, goalId };
          // 2. 개인 목표 삭제
          if(getGoal[i].goalId.headCount === 1) {
            await this.userGoalService.exitGoal(accessUserGoalData);
            await this.goalService.deleteGoal(goalId);
          }
          // 3. 팀 목표 처리
          // 3.1 현재 모집중인 팀 목표에 대한 탈퇴 처리
          if(getGoal[i].goalId.status === "recruit"){
            const find = await this.userGoalService.findUser(accessUserGoalData);
            if (find == null) {
              // error - 참가하지 않은 유저입니다.
              throw new HttpException('참가하지 않았습니다.', HttpStatus.BAD_REQUEST);
            } else {
              // 목표 개설자 인 경우
              // 참여 멤버 탈퇴 -> 목표 삭제
              if(getGoal[i].userId.userId == req.user) {
                const goalId = getGoal[i].goalId.goalId;
                const memberExit = await this.userGoalService.getGoalByGoalId(goalId);
                for(let j=0; j<memberExit.length; j++){
                  let usergoalId: number = memberExit[j].userGoalsId;
                  accessUserGoalData = {
                    userId: memberExit[j].userId.userId,
                    goalId: memberExit[j].goalId.goalId,
                  }
                  await this.userGoalService.exitGoal(accessUserGoalData);
                }
                await this.goalService.deleteGoal(getGoal[i].goalId.goalId);
              }else { // 목표 참가자인 경우
                await this.userGoalService.exitGoal(accessUserGoalData);
                // 참가자 숫자 변동
                getGoal[i].goalId.headCount -= 1;
                await this.goalService.updateGoalCurCount(goalId, getGoal[i].goalId.headCount);
              }
            }
          }else {
            // 3.2 현재 진행중이거나 완료된 목표에 대해서 balanceId = 0 처리
            const balanceId: number = getGoal[i].balanceId.balanceId;
            const current: number = 0;
            await this.balanceService.updateBalance(balanceId, current);
          }
        }
        // 뱃지 정보 삭제
        await this.badgeService.deleteBadgeInfo(userId);
        res.json({ message: "회원 탈퇴가 완료되었습니다." });
  }
}
