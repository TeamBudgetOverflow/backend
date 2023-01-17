import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goals } from '../models/goals';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goals)
        private goalRepository: Repository<Goals>,
    ) {}

    async createGoal(data/*: CreateGoalDTO*/): Promise<Goals>{
        const result = await this.goalRepository.save(data);

        return result;
    }

    async getAllGoals(): Promise<Goals[]> {
        const result: Goals[] = await this.goalRepository.find({
            order: {
                createdAt: "DESC",
            }
        });
        return result;
    }

    async getGoalDetail(goalId: number): Promise<Goals> {
        return await this.goalRepository.findOne({where: {goalId}});
    }

    async getGoalByGoalId(goalId: number): Promise<Goals> {
        return await this.goalRepository.findOneBy({goalId});
    }

    // 목표 참가자 숫자 변화
    async updateGoalCurCount(goalId: number, headCount: number) {
        await this.goalRepository.update({goalId}, {headCount});
    }
}
