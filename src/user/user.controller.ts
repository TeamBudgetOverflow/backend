import {
  Controller,
  Get,
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
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { BadgeService } from 'src/badges/badge.service';
import { NaverAuthGuard } from '../auth/naver/naver-auth.guard';
import { KakaoAuthGuard } from '../auth/kakao/kakao-auth.guard';
import { GoogleOauthGuard } from '../auth/google/google-oauth.guard';
import { UpdatePinCodeDTO } from './dto/updatePinCode.dto';
import { ModifyUserInfoDTO } from './dto/modifyUser.dto';
import { User } from 'src/common/decorators/user.decorator';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

@Controller('api/users')
export class UserController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    private readonly badgeService: BadgeService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('auth/google')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @User() user,
    @Query('code') code: string,
  ): Promise<any> {
    const {
      accessToken,
      refreshToken,
      newComer,
      name,
      isExistPinCode = false,
    } = await this.userService.login(user);
    const message = newComer
      ? 'Google OAuth Completed - Incoming User'
      : 'Google OAuth Completed - Returning User';
    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken,
      message,
      newComer,
      name,
      ...(isExistPinCode && { isExistPinCode }), // isExistPinCode가 true일 때만 추가
    };
  }

  @Post('auth/naver')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(
    @User() user,
    @Query('code') code: string,
  ): Promise<any> {
    const {
      accessToken,
      refreshToken,
      newComer,
      name,
      isExistPinCode = false,
    } = await this.userService.login(user);
    const message = newComer
      ? 'Naver OAuth Completed - Incoming User'
      : 'Naver OAuth Completed - Returning User';
    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken,
      message,
      newComer,
      name,
      ...(isExistPinCode && { isExistPinCode }),
    };
  }

  @UseGuards(KakaoAuthGuard)
  @Post('auth/kakao')
  async kakaoLoginCallback(
    @User() user,
    @Query('code') code: string,
  ): Promise<any> {
    const {
      accessToken,
      refreshToken,
      newComer,
      name,
      isExistPinCode = false,
    } = await this.userService.login(user);
    const message = newComer
      ? 'Kakao OAuth Completed - Incoming User'
      : 'Kakao OAuth Completed - Returning User';
    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken,
      message,
      newComer,
      name,
      ...(isExistPinCode && { isExistPinCode }),
    };
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async logout(@User() user) {
    const userId: number = user;
    await this.authService.deleteRefreshToken(userId);
    return { message: '로그아웃 성공' };
  }

  @Post(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async registerPinCode(
    @Param('userId') userId: number,
    @Body('pinCode') pinCode: string,
    @User() user,
  ) {
    console.log(pinCode);
    if (userId !== user) {
      throw new HttpException('허가되지 않은 접근입니다', 400);
    }
    if (!(pinCode.length === 6)) {
      throw new HttpException('잘못된 형식입니다.', 400);
    }
    const findUser = await this.userService.findUserByUserId(userId);
    if (!findUser) {
      throw new HttpException('존재하지 않는 유저입니다.', 400);
    }
    // if (findUser.pinCode) {
    //   throw new HttpException('이미 존재하는 핀코드입니다.', 400);
    // }
    await this.userService.registerPinCode(userId, pinCode);
    return { message: '핀 코드 등록 완료' };
  }

  @Put(':userId/pinCode')
  @UseGuards(AuthGuard('jwt'))
  async updatePinCode(
    @Param('userId') userId: number,
    @Body(new ValidationPipe()) updatePinCodeDTO: UpdatePinCodeDTO,
    @User() user,
  ) {
    if (userId !== user) {
      throw new HttpException('허가되지 않은 접근입니다', 400);
    }
    if (!(updatePinCodeDTO.updatePinCode.length === 6)) {
      throw new HttpException('잘못된 형식입니다.', 400);
    }
    if (updatePinCodeDTO.pinCode === updatePinCodeDTO.updatePinCode) {
      throw new HttpException('기존 pinCode와 일치합니다', 400);
    }
    const cryptoPinCode: string = createHash(
      this.configService.get<string>('ALGORITHM'),
    )
      .update(updatePinCodeDTO.pinCode)
      .digest('base64');
    const findUser = await this.userService.findUserByUserId(userId);
    // 핀코드가 제대로 입력되었는지 검증
    if (findUser.pinCode === cryptoPinCode) {
      const cryptoPinCode: string = createHash(
        this.configService.get<string>('ALGORITHM'),
      )
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
  async accessTokenReissue(@User() user) {
    const accessToken = await this.authService.createAccessToken(user);
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
    @User() user,
    @Param('userId') targetUserId: number,
    @Body(new ValidationPipe()) modifyInfo: ModifyUserInfoDTO,
  ) {
    const userId = user;
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
  async getUserGoal(@User() user, @Param('userId') userId: number) {
    const myUserId = user;
    const findGoals = await this.userGoalService.getGoalByUserId(userId);
    const result = await this.userService.dataProcessingForUserPage(
      findGoals,
      myUserId,
      userId,
    );
    return { result };
  }

  // 회원 탈퇴
  @Delete('exit/:userId')
  @UseGuards(AuthGuard('jwt'))
  async exitUsesr(@User() user, @Param('userId') userId: number) {
    console.log('회원탈퇴 ----------------------');
    console.log(user, userId);
    if (user !== Number(userId)) {
      throw new HttpException(
        '권한이 없는 호출입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userService.exitUser(userId, user);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
