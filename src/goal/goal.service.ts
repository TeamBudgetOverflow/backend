import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goals } from '../models/goals';
import { UserGoals } from '../models/usergoals';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goals, /*UserGoals*/)
        private goalRepository: Repository<Goals>,
        //private userGoalRepository: Repository<UserGoals>,
    ) {}

    async createGoal(data): Promise<Goals>{
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

    async joinUserGoal(goalId)/*: Promise<number>*/{
        // const [list, count] = await this.userGoalRepository.findAndCount({where: {goalId}});
        // console.log(list);
        // return count;
    }

    async joinGoal(userId: number, goalId: number) {
        //const result = await this.userGoalRepository.save({goalId});
    }
}