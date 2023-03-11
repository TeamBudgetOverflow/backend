import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UserGoals } from '../entity/usergoals';

@Injectable()
export class UserGoalService {
  constructor(
    @InjectRepository(UserGoals)
    private userGoalRepository: Repository<UserGoals>,
  ) {}

  // 목표에 참가한 유저 리스트와 숫자 리턴
  async getJoinUser(goalId) {
    return await this.userGoalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', { goalId })
      .leftJoin('g.userId', 'users')
      .leftJoin('g.balanceId', 'balance')
      .leftJoin('g.accountId', 'accounts')
      .select([
        'g',
        'users.userId',
        'users.nickname',
        'users.image',
        'balance.balanceId',
        'balance.current',
        'accounts.accountId',
      ])
      .getMany();
  }

  async getGoalByUserId(userId: number) {
    return await this.userGoalRepository
      .createQueryBuilder('g')
      .where('g.userId = :userId', { userId })
      .leftJoin('g.goalId', 'goals')
      .leftJoin('g.userId', 'users')
      .leftJoin('g.balanceId', 'balance')
      .leftJoin('g.accountId', 'account')
      .select(['g', 'goals', 'balance', 'users.userId', 'account.accountId'])
      .getMany();
  }

  async getGoalByGoalId(goalId: number) {
    return await this.userGoalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', { goalId })
      .leftJoin('g.goalId', 'goal')
      .leftJoin('g.userId', 'users')
      .leftJoin('g.balanceId', 'balance')
      .leftJoin('g.accountId', 'account')
      .select([
        'g',
        'goal.goalId',
        'goal.amount',
        'users.userId',
        'balance',
        'account.accountId',
      ])
      .getMany();
  }

  async getCountAchievPersonal(userId: number) {
    return await this.userGoalRepository
      .createQueryBuilder('g')
      .where('g.userId = :userId', { userId })
      .leftJoin('g.goalId', 'goals')
      .leftJoin('g.balanceId', 'balance')
      .andWhere('goals.headCount = 1')
      .andWhere('goals.amount = (balance.current - balance.initial)')
      .getCount();
  }

  async getCountAchievGroup(userId: number) {
    return await this.userGoalRepository
      .createQueryBuilder('g')
      .where('g.userId = :userId', { userId })
      .leftJoin('g.goalId', 'goals')
      .leftJoin('g.balanceId', 'balance')
      .andWhere('goals.headCount != 1')
      .andWhere('goals.amount = (balance.current - balance.initial)')
      .getCount();
  }

  async getCountUserPastJoin(userId: number) {
    return await this.userGoalRepository
      .createQueryBuilder('ug')
      .where('ug.userId = :userId', { userId })
      .andWhere('ug.status = :status', { status: 'done' })
      .leftJoin('ug.goalId', 'goals')
      .select(['ug', 'goals.headCount'])
      .getManyAndCount();
  }

  // 목표 참가
  async joinGoal(data, queryRunner: QueryRunner) {
    await queryRunner.manager.getRepository(UserGoals).save(data);
  }

  // 목표 탈퇴
  async exitGoal(data, queryRunner: QueryRunner) {
    const findId = await this.userGoalRepository.findOneBy(data);
    await queryRunner.manager.remove(findId.userGoalsId);
  }

  // 해당 목표에 참가한 유저인지 반환
  async findUser(data): Promise<UserGoals> {
    return await this.userGoalRepository.findOneBy(data);
  }

  // 목표 시작 혹은 종료, 신고 처리 시 status 변화
  async updateStauts(
    userGoalsId: number,
    status: string,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.update(UserGoals, userGoalsId, { status });
  }
}
