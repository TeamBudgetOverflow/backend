import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import { Goals } from '../models/goals';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';
import { UpdateGoalDTO } from '../goal/dto/updateGoal.dto';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goals)
    private goalRepository: Repository<Goals>,
  ) {}

  async createGoal(data /*: CreateGoalDTO*/): Promise<Goals> {
    const result = await this.goalRepository.save(data);

    return result;
  }

  async getAllGoals(take: number, page: number): Promise<Goals[]> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', { statuses: ["recruit", "proceeding"] })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy('g.createdAt', 'DESC')
      .take(take)
      .skip(take * ( page - 1 ))
      .getMany();
  }

  async searchGoal(
    keyword: string, sortOby: string, statuses: string[],
    min: number, max: number, orderby: 'ASC'|'DESC',
    take: number, page: number
    ): Promise<Goals[]>{
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', {statuses})
      .andWhere(`${sortOby} BETWEEN ${min} AND ${max}`)
      .andWhere(new Brackets((qb) => {
        qb.where('g.title like :keyword', { keyword: `%${keyword}%` })
          .orWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` })
      }))
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(`${sortOby}`, `${orderby}`)
      .take(take)
      .skip(take * ( page - 1 ))
      .getMany();
  }

  async searchGoalNotValue(
    keyword: string, sortOby: string, statuses: string[], orderby: 'ASC'|'DESC',
    take: number, page: number
    ): Promise<Goals[]>{
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', {statuses})
      .andWhere(new Brackets((qb) => {
        qb.where('g.title like :keyword', { keyword: `%${keyword}%` })
          .orWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` })
      }))
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(`${sortOby}`, `${orderby}`)
      .take(take)
      .skip(take * ( page - 1 ))
      .getMany();
  }

  async getGoalDetail(goalId: number): Promise<Goals> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', {goalId})
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .getOne();
  }

  async getGoalByGoalId(goalId: number): Promise<Goals> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', {goalId})
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId'])
      .getOne();
  }

  // 목표 참가자 숫자 변화
  async updateGoalCurCount(goalId: number, curCount: number) {
    await this.goalRepository.update({ goalId }, { curCount });
  }

  async updateGoal(goalId: number, data: UpdateGoalDTO) {
    await this.goalRepository.update({ goalId }, data);
  }

  // 목표 시작, 완료 시 호출
  async goalUpdateStatus(goalId: number, status: string) {
    await this.goalRepository.update({ goalId }, { status });
  }

  async deleteGoal(goalId: number) {
    await this.goalRepository.delete({ goalId });
  }
}
