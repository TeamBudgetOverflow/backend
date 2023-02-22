import * as dotenv from 'dotenv';
import { Response } from 'express';
import {
  Controller,
  Get,
  Req,
  Res,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  forwardRef,
  Inject,
  Post,
  Patch,
  Put,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { GoalService } from 'src/goal/goal.service';
import { BadgeService } from 'src/badges/badge.service';
import { BalanceService } from 'src/balances/balances.service';
import { NaverAuthGuard } from '../auth/naver/naver-auth.guard';
import { KakaoAuthGuard } from '../auth/kakao/kakao-auth.guard';
import { GoogleOauthGuard } from '../auth/google/google-oauth.guard';
import { AccessUserGoalDTO } from 'src/usergoal/dto/accessUserGoals.dto';
import { ExitUserDTO } from './dto/exitUser.dto';
import { UpdatePinCodeDTO } from './dto/updatePinCode.dto';
import { ModifyUserInfoDTO } from './dto/modifyUser.dto';
import { AccountsService } from 'src/accounts/accounts.service';

dotenv.config();

@Controller('api/users')
export class UserController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    @Inject(forwardRef(() => BalanceService))
    private readonly balanceService: BalanceService,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountsService: AccountsService,
    private readonly badgeService: BadgeService,
    private readonly userService: UserService,
  ) {}

  @Post('auth/google')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Query('code') code: string,
  ): Promise<any> {
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
      return {
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: 'Google OAuth Completed - Incoming User',
        newComer: true,
        name: createUser.name,
      };
    }
    // 유저가 있을때
    let isExistPinCode: Boolean;
    if (user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    return {
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: 'Google OAuth Completed - Returning User',
      newComer: false,
      name: user.name,
      isExistPinCode,
    };
  }

  @Post('auth/naver')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(
    @Req() req,
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
      return {
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '로그인 성공',
        newComer: true,
        name: createUser.name,
      };
    }
    // 유저가 있을때
    let isExistPinCode: Boolean;
    if (user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    return {
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '로그인 성공',
      newComer: false,
      name: user.name,
      isExistPinCode,
    };
  }

  @UseGuards(KakaoAuthGuard)
  @Post('auth/kakao')
  async kakaoLoginCallback(
    @Req() req,
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
      return {
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '로그인 성공',
        newComer: true,
        name: createUser.name,
      };
    }
    // 유저가 있을때
    let isExistPinCode: Boolean;
    if (user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    return {
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '로그인 성공',
      newComer: false,
      name: user.name,
      isExistPinCode,
    };
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req) {
    const userId: number = req.user;
    await this.authService.deleteRefreshToken(userId);
    return { message: '로그아웃 성공' };
  }

  @Post(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async registerPinCode(
    @Param('userId') userId: number,
    @Body('pinCode') pinCode: string,
    @Req() req,
  ) {
    if (userId !== req.user) {
      throw new HttpException('허가되지 않은 접근입니다', 400);
    }
    if (!(pinCode.length === 6)) {
      throw new HttpException('잘못된 형식입니다.', 400);
    }
    const findUser = await this.userService.findUserByUserId(userId);
    if (!findUser) {
      throw new HttpException('존재하지 않는 유저입니다.', 400);
    }
    if (findUser.pinCode) {
      throw new HttpException('이미 존재하는 핀코드입니다.', 400);
    }
    const cryptoPinCode: string = createHash(process.env.ALGORITHM)
      .update(pinCode)
      .digest('base64');
    await this.userService.registerPinCode(userId, cryptoPinCode);
    return { message: '핀 코드 등록 완료' };
  }

  @Put(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async updatePinCode(
    @Param('userId') userId: number,
    @Body() updatePinCodeDTO: UpdatePinCodeDTO,
    @Req() req,
  ) {
    if (userId !== req.user) {
      throw new HttpException('허가되지 않은 접근입니다', 400);
    }
    if (!(updatePinCodeDTO.updatePinCode.length === 6)) {
      throw new HttpException('잘못된 형식입니다.', 400);
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
      return { message: '핀 코드 수정 완료' };
    } else {
      throw new HttpException('입력한 pinCode가 올바르지 않습니다', 400);
    }
  }

  // 리프레쉬 토큰을 이용한 엑세스 토큰 재발급하기
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('pinCode')
  async accessTokenReissue(@Body('pinCode') pinCode: string, @Req() req) {
    const accessToken = await this.authService.createAccessToken(req.user);
    return {
      accessToken: 'Bearer ' + accessToken,
      message: 'accessToken 재발급',
    };
  }

  @Get('badges')
  @UseGuards(AuthGuard('jwt'))
  async getAllBadges() {
    const getALLBadges = await this.badgeService.getALLBadges();
    return { result: getALLBadges };
  }

  @Get('badges/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getMyBadges(@Param('userId') userId: number) {
    const findUserBadges = await this.badgeService.getUserBadges(userId);
    const result = [];
    for (let i = 0; i < findUserBadges.length; i++) {
      result.push({
        badgeId: findUserBadges[i].Badges.badgeId,
      });
    }
    return { result: result };
  }

  @Get(':userId')
  async getUserProfile(@Param('userId') targetUserId: number) {
    const targetUserProfile = await this.userService.getUserProfile(
      targetUserId,
    );
    if (targetUserProfile) {
      return targetUserProfile;
    } else {
      throw new HttpException('User Does not exist', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'))
  async modifyUserProfile(
    @Req() req,
    @Param('userId') targetUserId: number,
    @Body() modifyInfo: ModifyUserInfoDTO,
  ) {
    const userId = req.user;
    if (targetUserId === userId) {
      await this.userService.modifyUser(userId, modifyInfo);
      return {
        message: 'Updated User Profile Succesfully',
      };
    } else {
      throw new HttpException('User Does not exist', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':userId/goals')
  @UseGuards(AuthGuard('jwt'))
  async getUserGoal(@Req() req, @Param('userId') userId: number) {
    const myUserId = req.user;
    const findGoals = await this.userGoalService.getGoalByUserId(userId);
    const result = [];
    for (let i = 0; i < findGoals.length; i++) {
      if (myUserId != userId && findGoals[i].goalId.isPrivate == true) {
        continue;
      } else if (findGoals[i].goalId.status === 'denied') {
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
    return { result: result };
  }

  // 회원 탈퇴
  @Delete('exit/:userId')
  @UseGuards(AuthGuard('jwt'))
  async exitUsesr(@Req() req, @Param('userId') userId: number) {
    if (req.user !== Number(userId)) {
      throw new HttpException(
        '권한이 없는 호출입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const data: ExitUserDTO = {
      email: 'Exit User', // 현재 협의가 필요
      name: '탈퇴한 사용자',
      nickname: '탈퇴한 사용자',
      image: null,
      loginCategory: null,
      pinCode: null,
      refreshToken: null,
      description: null,
    };
    // 1. 회원 정보 빈 값 처리
    await this.userService.exitUser(userId, data);
    const getGoal = await this.userGoalService.getGoalByUserId(userId);
    for (let i = 0; i < getGoal.length; i++) {
      let goalId: number = getGoal[i].goalId.goalId;
      let accessUserGoalData: AccessUserGoalDTO = {
        userId,
        goalId,
      };
      // 2. 개인 목표 삭제
      if (getGoal[i].goalId.headCount === 1) {
        await this.userGoalService.exitGoal(accessUserGoalData);
        await this.goalService.deleteGoal(goalId);
      }
      // 3. 팀 목표 처리
      // 3.1 현재 모집중인 팀 목표에 대한 탈퇴 처리
      if (getGoal[i].goalId.status === 'recruit') {
        const find = await this.userGoalService.findUser(accessUserGoalData);
        if (find == null) {
          // error - 참가하지 않은 유저입니다.
          throw new HttpException(
            '참가하지 않았습니다.',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          // 목표 개설자 인 경우
          // 참여 멤버 탈퇴 -> 목표 삭제
          if (getGoal[i].userId.userId == req.user) {
            const goalId = getGoal[i].goalId.goalId;
            const memberExit = await this.userGoalService.getGoalByGoalId(
              goalId,
            );
            for (let j = 0; j < memberExit.length; j++) {
              let accountId: number = memberExit[j].accountId.accountId;
              let balanceId: number = memberExit[j].balanceId.balanceId;
              accessUserGoalData = {
                userId: memberExit[j].userId.userId,
                goalId: memberExit[j].goalId.goalId,
              };
              await this.userGoalService.exitGoal(accessUserGoalData);
              await this.accountsService.deleteAccount(accountId);
              await this.balanceService.deleteBalance(balanceId);
            }
            await this.goalService.deleteGoal(getGoal[i].goalId.goalId);
          } else {
            let accountId: number = find[i].accountId.accountId;
            let balanceId: number = find[i].balanceId.balanceId;
            // 목표 참가자인 경우
            await this.userGoalService.exitGoal(accessUserGoalData);
            await this.accountsService.deleteAccount(accountId);
            await this.balanceService.deleteBalance(balanceId);
            // 참가자 숫자 변동
            getGoal[i].goalId.headCount -= 1;
            await this.goalService.updateGoalCurCount(
              goalId,
              getGoal[i].goalId.headCount,
            );
          }
        }
      } else {
        // 3.2 현재 진행중이거나 완료된 목표에 대해서
        // balanceId = 0 처리 accountId 처리
        const balanceId: number = getGoal[i].balanceId.balanceId;
        const accountId: number = getGoal[i].accountId.accountId;
        const current: number = 0;
        await this.accountsService.deleteAccount(accountId);
        await this.balanceService.updateBalance(balanceId, current);
      }
    }
    // 뱃지 정보 삭제
    await this.badgeService.deleteBadgeInfo(userId);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
