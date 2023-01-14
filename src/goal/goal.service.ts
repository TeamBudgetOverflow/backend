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

    async getGoalByGoalId(goalId: number): Promise<Goals> {
        return await this.goalRepository.findOneBy({goalId});
    }

    async updateGoal(goalId: number, headCount: number) {
        await this.goalRepository.update({goalId}, {headCount});
    }
}