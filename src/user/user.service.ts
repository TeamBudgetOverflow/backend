import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';
import { BadgeService } from 'src/badges/badge.service';
import { BalanceService } from 'src/balances/balances.service';
import { UserGoals } from 'src/entity/usergoals';
import { GoalService } from 'src/goal/goal.service';
import { AccessUserGoalDTO } from 'src/usergoal/dto/accessUserGoals.dto';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Users } from '../entity/users';
import { ExitUserDTO } from './dto/exitUser.dto';
import { ModifyUserInfoDTO } from './dto/modifyUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @Inject(forwardRef(() => AuthService))
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    @Inject(forwardRef(() => BalanceService))
    private readonly balanceService: BalanceService,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountsService: AccountsService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    private readonly badgeService: BadgeService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async login(user: Users) {
    const existUser = await this.findUserByEmailAndCategory(
      user.email,
      user.loginCategory,
    );
    if (existUser === null) {
      const createUser = await this.oauthCreateUser(user);
      const { accessToken, refreshToken } = await this.generateToken(
        createUser,
      );
      return {
        accessToken,
        refreshToken,
        newComer: true,
        name: createUser.name,
      };
    } else {
      let isExistPinCode: Boolean;
      if (existUser.pinCode) isExistPinCode = true;
      else isExistPinCode = false;
      const { accessToken, refreshToken } = await this.generateToken(existUser);
      return {
        accessToken,
        refreshToken,
        newComer: false,
        name: existUser.name,
        isExistPinCode,
      };
    }
  }

  async generateToken(user: Users) {
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async findUserByEmailAndCategory(
    email: string,
    loginCategory: string,
  ): Promise<Users> {
    const option = {
      where: { email, loginCategory },
      offset: 0,
      limit: 1,
      raw: true, //조회한 결과 객체로만 표기 옵션
    };
    return this.userRepository.findOne(option);
  }

  findUserByUserId(userId: number): Promise<Users> {
    const option = {
      where: { userId },
      offset: 0,
      limit: 1,
      raw: true,
    };
    return this.userRepository.findOne(option);
  }

  oauthCreateUser(user: Users): Promise<Users> {
    return this.userRepository.save(user);
  }

  async createRefreshToken(userId: number, refreshToken: string) {
    await this.userRepository.update(userId, { refreshToken });
  }

  async registerPinCode(userId: number, pinCode: string) {
    const cryptoPinCode: string = createHash(
      this.configService.get<string>('ALGORITHM'),
    )
      .update(pinCode)
      .digest('base64');
    await this.userRepository.update(userId, { pinCode: cryptoPinCode });
  }

  async checkUpdate(userId: number, pinCode: string) {
    const findUser = await this.findUserByUserId(userId);
    if (findUser.pinCode === pinCode) {
      throw new HttpException('기존 pinCode와 일치합니다', 400);
    }
  }

  async getUserProfile(userId: number) {
    const targetUserInfo = await this.userRepository
      .createQueryBuilder('u')
      .where('u.userId = :userId', { userId })
      .select([
        'u.email',
        'u.name',
        'u.nickname',
        'u.image',
        'u.loginCategory',
        'u.description',
      ])
      .getOne();
    return targetUserInfo;
  }

  async modifyUser(userId: number, modifyInfo: ModifyUserInfoDTO) {
    const targetUserInfo = await this.userRepository.findOneBy({ userId });
    const { nickname, image, description } = modifyInfo;

    targetUserInfo.nickname = nickname;
    targetUserInfo.image = image;
    targetUserInfo.description = description;
    await this.userRepository.save(targetUserInfo);
  }

  async dataProcessingForUserPage(
    findGoals: UserGoals[],
    myUserId: number,
    userId: number,
  ) {
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
    return result;
  }

  async exitUser(userId: number, user: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('트렌젝션 시작');
      // 1. 회원 정보 빈 값 처리
      await this.nullableUserData(userId, queryRunner);
      // 2. 회원이 참가한 목표에 대한 처리
      const getGoal = await this.userGoalService.getGoalByUserId(userId);
      for (let i = 0; i < getGoal.length; i++) {
        let goalId: number = getGoal[i].goalId.goalId;
        let accessUserGoalData: AccessUserGoalDTO = {
          userId,
          goalId,
        };
        // 2.1 개인 목표 삭제
        if (getGoal[i].goalId.headCount === 1) {
          await this.deletePersonalGoal(
            accessUserGoalData,
            goalId,
            queryRunner,
          );
        }
        // 2.2 팀 목표 처리
        await this.processTeamGoal(
          getGoal,
          accessUserGoalData,
          i,
          user,
          goalId,
          queryRunner,
        );
      }
      // 4. 뱃지 정보 삭제
      await this.badgeService.deleteBadgeInfo(userId, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 회원 정보 빈 값 처리
  async nullableUserData(userId: number, queryRunner: QueryRunner) {
    const data: ExitUserDTO = {
      email: 'Exit User',
      name: '탈퇴한 사용자',
      nickname: '탈퇴한 사용자',
      image: null,
      loginCategory: null,
      pinCode: null,
      refreshToken: null,
      description: null,
    };
    await queryRunner.manager.update(Users, userId, data);
  }

  // 개인 목표 삭제
  async deletePersonalGoal(
    accessUserGoalData: AccessUserGoalDTO,
    goalId: number,
    queryRunner: QueryRunner,
  ) {
    await this.userGoalService.exitGoal(accessUserGoalData, queryRunner);
    await this.goalService.deleteGoal(goalId, queryRunner);
  }

  // 팀 목표 처리
  async processTeamGoal(
    getGoal: UserGoals[],
    accessUserGoalData: AccessUserGoalDTO,
    i: number,
    user: number,
    goalId: number,

    queryRunner: QueryRunner,
  ) {
    // 1 현재 모집중인 팀 목표에 대한 탈퇴 처리
    if (getGoal[i].goalId.status === 'recruit') {
      await this.processTeamGoalIfRecruit(
        getGoal,
        accessUserGoalData,
        i,
        goalId,
        user,
        queryRunner,
      );
    } else {
      // 2 현재 진행중이거나 완료된 목표에 대해서
      await this.processTeamGoalIfElse(getGoal, i, queryRunner);
    }
  }

  // 현재 모집중인 팀 목표에 대한 처리
  async processTeamGoalIfRecruit(
    getGoal: UserGoals[],
    accessUserGoalData: AccessUserGoalDTO,
    i: number,
    goalId: number,
    user: number,
    queryRunner: QueryRunner,
  ) {
    const find = await this.userGoalService.findUser(accessUserGoalData);
    if (find == null) {
      // error - 참가하지 않은 유저입니다.
      throw new HttpException('참가하지 않았습니다.', HttpStatus.BAD_REQUEST);
    } else {
      // 목표 개설자 인 경우
      // 참여 멤버 탈퇴 -> 목표 삭제
      if (getGoal[i].userId.userId == user) {
        const goalId = getGoal[i].goalId.goalId;
        const memberExit = await this.userGoalService.getGoalByGoalId(goalId);
        for (let j = 0; j < memberExit.length; j++) {
          let accountId: number = memberExit[j].accountId.accountId;
          let balanceId: number = memberExit[j].balanceId.balanceId;
          accessUserGoalData = {
            userId: memberExit[j].userId.userId,
            goalId: memberExit[j].goalId.goalId,
          };
          await this.userGoalService.exitGoal(accessUserGoalData, queryRunner);
          await this.accountsService.deleteAccount(accountId, queryRunner);
          await this.balanceService.deleteBalance(balanceId, queryRunner);
        }
        await this.goalService.deleteGoal(
          getGoal[i].goalId.goalId,
          queryRunner,
        );
      } else {
        let accountId: number = find[i].accountId.accountId;
        let balanceId: number = find[i].balanceId.balanceId;
        // 목표 참가자인 경우
        await this.userGoalService.exitGoal(accessUserGoalData, queryRunner);
        await this.accountsService.deleteAccount(accountId, queryRunner);
        await this.balanceService.deleteBalance(balanceId, queryRunner);
        // 참가자 숫자 변동
        getGoal[i].goalId.headCount -= 1;
        await this.goalService.updateGoalCurCount(
          goalId,
          getGoal[i].goalId.headCount,
          queryRunner,
        );
      }
    }
  }

  // 현재 진행중이거나 완료된 목표에 대해 처리
  async processTeamGoalIfElse(
    getGoal: UserGoals[],
    i: number,
    queryRunner: QueryRunner,
  ) {
    // balanceId = 0 처리 accountId 처리
    const balanceId: number = getGoal[i].balanceId.balanceId;
    const accountId: number = getGoal[i].accountId.accountId;
    const current: number = 0;
    await this.accountsService.deleteAccount(accountId, queryRunner);
    await this.balanceService.updateBalance(balanceId, current, queryRunner);
  }
}
