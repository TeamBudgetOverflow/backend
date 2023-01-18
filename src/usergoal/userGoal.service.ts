import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGoals } from '../models/usergoals';
import { AccessUserGoalDTO } from '../usergoal/dto/accessUserGoals.dto';

@Injectable()
export class UserGoalService {
  constructor(
    @InjectRepository(UserGoals)
    private userGoalRepository: Repository<UserGoals>,
  ) {}

  // 목표에 참가한 유저 리스트와 숫자 리턴
  async getJoinUser(goalId) /*: Promise<number>*/ {
    const [list, count] = await this.userGoalRepository.findAndCount({
      where: { goalId },
      relations: ["userId"]
    });
    return {list, count};
  }

  // 목표 참가
  async joinGoal(data /*: AccessUserGoalDTO*/) {
    await this.userGoalRepository.save(data);
  }

  // 목표 탈퇴
  async exitGoal(data /*: AccessUserGoalDTO*/) {
    const findId = await this.userGoalRepository.findOneBy(data);
    await this.userGoalRepository.delete(findId.userGoalsId);
  }

  // 해당 목표에 참가한 유저인지 반환
  async findUser(data /*: AccessUserGoalDTO*/): Promise<UserGoals> {
    return await this.userGoalRepository.findOneBy(data);
  }
}
