import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goals } from '../models/goals';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goals)
        private goalsRepository: Repository<Goals>,
    ) {}

    async createGoal(data): Promise<Goals>{
        // let goals = new Goals;
        // goals.amount = data.amount;
        // goals.startDate = data.startDate;
        // goals.endDate= data.endDate;
        // goals.headCount = data.headCount;
        // goals.title = data.title;
        // goals.description = data.description;
        // goals.user = data.userId;
        // console.log(goals);
        const result = await this.goalsRepository.save(data);
        console.log(result);
        return result;
    }
}