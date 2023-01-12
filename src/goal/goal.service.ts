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

    async createGoal(createGoalDTO: CreateGoalDTO, userId: number){
        const result =  await this.goalsRepository.save({userId, ...createGoalDTO});
        console.log(result);
        //const findUserUpdate = await this.goalsRepository.findOneBy({userId});
        return result;
    }
}