import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Between } from 'typeorm';
import { Goals } from '../entity/goals';
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

  async getAllGoals(take: number, cursor: number): Promise<[Goals[], number]> {
    const query = await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', {
        statuses: ['recruit', 'proceeding'],
      })
      .andWhere('g.headCount != 1')
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname']);
    if (cursor) query.andWhere('g.goalId < :cursor', { cursor });
    const result = query
      .orderBy('g.createdAt', 'DESC')
      // 결과값이 5일 경우 다음 페이지가 존재하는지 검증 하기위해 6개씩 take
      .take(take + 1)
      .getManyAndCount();
    return result;
  }

  async searchGoal(
    keyword: string,
    sortOby: string,
    statuses: string[],
    min: number,
    max: number,
    orderby: 'ASC' | 'DESC',
    take: number,
    cursor: number,
    id: number,
  ): Promise<[Goals[], number]> {
    const sortCondition = {};
    sortCondition[sortOby] = orderby;
    sortCondition['g.goalId'] = orderby;
    const query = await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', { statuses })
      .andWhere(`${sortOby} BETWEEN ${min} AND ${max}`)
      .andWhere('g.headCount != 1')
      .andWhere(
        new Brackets((qb) => {
          qb.where('g.title like :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` });
        }),
      )
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(sortCondition);
    if (cursor) {
      if (orderby === 'DESC') {
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`${sortOby} = :cursor AND g.goalId < :id`, {
              cursor,
              id,
            }).orWhere(`${sortOby} < :cursor`, { cursor });
          }),
        );
      } else {
        // ASC
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`${sortOby} = :cursor AND g.goalId > :id`, {
              cursor,
              id,
            }).orWhere(`${sortOby} > :cursor`, { sortOby, cursor });
          }),
        );
      }
    }
    const result = await query.take(take + 1).getManyAndCount();
    return result;
  }

  async searchGoalNotValue(
    keyword: string,
    sortOby: string,
    statuses: string[],
    orderby: 'ASC' | 'DESC',
    take: number,
    id: number,
  ): Promise<[Goals[], number]> {
    const query = await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status IN (:...statuses)', { statuses })
      .andWhere('g.headCount != 1')
      .andWhere(
        new Brackets((qb) => {
          qb.where('g.title like :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('g.hashTag like :keyword', { keyword: `%${keyword}%` });
        }),
      )
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy(`${sortOby}`, `${orderby}`);
    if (id) {
      if (orderby === 'DESC') query.andWhere(`g.goalId < :id`, { id });
      else query.andWhere(`g.goalId > :id`, { id });
    }
    const result = query.take(take + 1).getManyAndCount();
    return result;
  }

  async getImminentGoal(take: number, status: string): Promise<Goals[]> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.status = :status', { status })
      .andWhere('g.curcount != g.headcount')
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .orderBy('g.startDate', 'ASC')
      .take(take)
      .getMany();
  }

  async getGoalDetail(goalId: number): Promise<Goals> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', { goalId })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId', 'users.nickname'])
      .getOne();
  }

  async getGoalByGoalId(goalId: number): Promise<Goals> {
    return await this.goalRepository
      .createQueryBuilder('g')
      .where('g.goalId = :goalId', { goalId })
      .leftJoin('g.userId', 'users')
      .select(['g', 'users.userId'])
      .getOne();
  }

  async getStartGoalByStatus(
    status: string,
    aDate: string,
    bDate: string,
  ): Promise<Goals[]> {
    return await this.goalRepository.find({
      where: { status, startDate: Between(new Date(aDate), new Date(bDate)) },
    });
  }

  async getEndGoalByStatus(
    status: string,
    aDate: string,
    bDate: string,
  ): Promise<Goals[]> {
    return await this.goalRepository.find({
      where: { status, endDate: Between(new Date(aDate), new Date(bDate)) },
    });
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

  // 목표 삭제
  async deleteGoal(goalId: number) {
    await this.goalRepository.delete({ goalId });
  }

  // 신고로 인한 삭제시 status만 변경하여 검색에서 제외됨
  async denyGoal(goalId: number) {
    const status: string = 'denied';
    return await this.goalRepository.update({ goalId }, { status });
  }
}
