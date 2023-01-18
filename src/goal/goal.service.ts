import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async getGoalDetail(goalId: number): Promise<Goals> {
    // return await this.goalRepository.findOne({ 
    //   where: { goalId },
    //   join: { 
    //     alias: 'Users',
    //     leftJoinAndSelect: { 
    //       userId: 'Users.userId',
    //     },
    //   }
    // });
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', {goalId})
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .getOne();
  }

  async getGoalByGoalId(goalId: number): Promise<Goals> {
    return await this.goalRepository.findOneBy({ goalId });
  }

  // 목표 참가자 숫자 변화
  async updateGoalCurCount(goalId: number, curCount: number) {
    await this.goalRepository.update({ goalId }, { curCount });
  }

  async updateGoal(goalId: number, updateGoal: UpdateGoalDTO) {
    await this.goalRepository.update({ goalId }, updateGoal);
  }

  async deleteGoal(goalId: number) {
    await this.goalRepository.delete({ goalId });
  }
}
