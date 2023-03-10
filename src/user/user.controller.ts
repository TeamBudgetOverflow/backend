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
    // ????????? ?????????
    let isExistPinCode: Boolean;
    if (user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: 'Google OAuth Completed - Returning User',
      newComer: false,
      name: user.name,
      isExistPinCode,
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
      // ????????? ????????? ???????????? -> ?????????
      const createUser = await this.userService.oauthCreateUser(req.user);
      // console.log(createUser)
      const accessToken = await this.authService.createAccessToken(createUser);
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      return res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '????????? ??????',
        newComer: true,
        name: createUser.name,
      });
    }
    // ????????? ?????????
    let isExistPinCode: Boolean;
    if (user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '????????? ??????',
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
      // ????????? ????????? ???????????? -> ?????????
      const createUser = await this.userService.oauthCreateUser(req.user);
      const accessToken = await this.authService.createAccessToken(createUser);
      const refreshToken = await this.authService.createRefreshToken(
        createUser,
      );
      return res.json({
        accessToken: 'Bearer ' + accessToken,
        refreshToken,
        message: '????????? ??????',
        newComer: true,
        name: createUser.name,
      });
    }
    // ????????? ?????????
    let isExistPinCode: Boolean;
    if (user.pinCode) isExistPinCode = true;
    else isExistPinCode = false;
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    res.json({
      accessToken: 'Bearer ' + accessToken,
      refreshToken,
      message: '????????? ??????',
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
    res.json({ message: '???????????? ??????' });
  }

  @Post(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async registerPinCode(
    @Param('userId') userId: number,
    @Body('pinCode') pinCode: string,
    @Req() req,
    @Res() res: Response,
  ) {
    if (userId !== req.user) {
      throw new HttpException('???????????? ?????? ???????????????', 400);
    }
    if (!(pinCode.length === 6)) {
      throw new HttpException('????????? ???????????????.', 400);
    }
    const findUser = await this.userService.findUserByUserId(userId);
    if (!findUser) {
      throw new HttpException('???????????? ?????? ???????????????.', 400);
    }
    if (findUser.pinCode) {
      throw new HttpException('?????? ???????????? ??????????????????.', 400);
    }
    const cryptoPinCode: string = createHash(process.env.ALGORITHM)
      .update(pinCode)
      .digest('base64');
    await this.userService.registerPinCode(userId, cryptoPinCode);
    res.json({ message: '??? ?????? ?????? ??????' });
  }

  @Put(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async updatePinCode(
    @Param('userId') userId: number,
    @Body() updatePinCodeDTO: UpdatePinCodeDTO,
    @Req() req,
    @Res() res: Response,
  ) {
    if (userId !== req.user) {
      throw new HttpException('???????????? ?????? ???????????????', 400);
    }
    if (!(updatePinCodeDTO.updatePinCode.length === 6)) {
      throw new HttpException('????????? ???????????????.', 400);
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
      res.json({ message: '??? ?????? ?????? ??????' });
    } else {
      throw new HttpException('????????? pinCode??? ???????????? ????????????', 400);
    }
  }

  // ???????????? ????????? ????????? ????????? ?????? ???????????????
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
      message: 'accessToken ?????????',
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
        badgeId: findUserBadges[i].Badges.badgeId,
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
      targetUserId,
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
    if (targetUserId === userId) {
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
    res.json({ result: result });
  }

  // ?????? ??????
  @Delete('exit/:userId')
  @UseGuards(AuthGuard('jwt'))
  async exitUsesr(
    @Req() req,
    @Param('userId') userId: number,
    @Res() res: Response,
  ) {
    if (req.user !== Number(userId)) {
      throw new HttpException(
        '????????? ?????? ???????????????.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const data: ExitUserDTO = {
      email: 'Exit User', // ?????? ????????? ??????
      name: '????????? ?????????',
      nickname: '????????? ?????????',
      image: null,
      loginCategory: null,
      pinCode: null,
      refreshToken: null,
      description: null,
    };
    // 1. ?????? ?????? ??? ??? ??????
    await this.userService.exitUser(userId, data);
    const getGoal = await this.userGoalService.getGoalByUserId(userId);
    for (let i = 0; i < getGoal.length; i++) {
      let goalId: number = getGoal[i].goalId.goalId;
      let accessUserGoalData: AccessUserGoalDTO = {
        userId,
        goalId,
      };
      // 2. ?????? ?????? ??????
      if (getGoal[i].goalId.headCount === 1) {
        await this.userGoalService.exitGoal(accessUserGoalData);
        await this.goalService.deleteGoal(goalId);
      }
      // 3. ??? ?????? ??????
      // 3.1 ?????? ???????????? ??? ????????? ?????? ?????? ??????
      if (getGoal[i].goalId.status === 'recruit') {
        const find = await this.userGoalService.findUser(accessUserGoalData);
        if (find == null) {
          // error - ???????????? ?????? ???????????????.
          throw new HttpException(
            '???????????? ???????????????.',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          // ?????? ????????? ??? ??????
          // ?????? ?????? ?????? -> ?????? ??????
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
            // ?????? ???????????? ??????
            await this.userGoalService.exitGoal(accessUserGoalData);
            await this.accountsService.deleteAccount(accountId);
            await this.balanceService.deleteBalance(balanceId);
            // ????????? ?????? ??????
            getGoal[i].goalId.headCount -= 1;
            await this.goalService.updateGoalCurCount(
              goalId,
              getGoal[i].goalId.headCount,
            );
          }
        }
      } else {
        // 3.2 ?????? ?????????????????? ????????? ????????? ?????????
        // balanceId = 0 ?????? accountId ??????
        console.log(getGoal[i]);
        const balanceId: number = getGoal[i].balanceId.balanceId;
        const accountId: number = getGoal[i].accountId.accountId;
        const current: number = 0;
        await this.accountsService.deleteAccount(accountId);
        await this.balanceService.updateBalance(balanceId, current);
      }
    }
    // ?????? ?????? ??????
    await this.badgeService.deleteBadgeInfo(userId);
    res.json({ message: '?????? ????????? ?????????????????????.' });
  }
}
