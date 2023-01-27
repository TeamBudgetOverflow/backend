import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

  async getAllGoals(): Promise<Goals[]> {
    const result: Goals[] = await this.goalRepository.find({
      relations: ["userId"],
      order: { createdAt: 'DESC' },
    });
    return result;
  }

  async searchGoal(
    keyword: string, sortOby: string, statuses: string[],
    min: number|Date, max: number|Date, orderby: 'ASC'|'DESC'
    ): Promise<Goals[]>{
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', {statuses})
      .andWhere(`${sortOby} BETWEEN ${min} AND ${max}`)
      .andWhere('g.title like :keyword', { keyword: `%${keyword}%` })
      .andWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(`${sortOby}`, `${orderby}`)
      .getMany();
  }

  async searchGoalNotValue(
    keyword: string, sortOby: string, statuses: string[], orderby: 'ASC'|'DESC'
    ): Promise<Goals[]>{
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', {statuses})
      .andWhere('g.title like :keyword', { keyword: `%${keyword}%` })
      .andWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(`${sortOby}`, `${orderby}`)
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

  async deleteGoal(goalId: number) {
    await this.goalRepository.delete({ goalId });
  }
}
