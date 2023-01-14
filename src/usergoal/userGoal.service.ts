import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGoals } from '../models/usergoals';
import { CreateUserGoalDTO } from '../usergoal/dto/createUserGoals.dto';

@Injectable()
export class UserGoalService {
  constructor(
    @InjectRepository(UserGoals)
        private userGoalRepository: Repository<UserGoals>,
    ) {}

    async getJoinUser(goalId)/*: Promise<number>*/{
        const [list, count] = await this.userGoalRepository.findAndCount({where: {goalId}});
        console.log(list);
        return count;
    }

    async joinGoal(data/*: CreateUserGoalDTO*/) {
        await this.userGoalRepository.save(data);
    }

    // async exitGoal(userId: number, goalId: number) {
    //     const findId = await this.userGoalRepository.findOneBy({where: {userId, goalId}});
    //     await this.userGoalRepository.delete(findId.userGoalsId);
    // }
}