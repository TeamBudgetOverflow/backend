import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reports } from 'src/entity/reports';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports)
    private reportRepository: Repository<Reports>,
  ) {}

  async createReport(data): Promise<Reports> {
    return await this.reportRepository.save(data);
  }

  async getReport(data): Promise<Reports> {
    return await this.reportRepository
      .createQueryBuilder('r')
      .where('r.User = :User', { User: data.User })
      .andWhere('r.Goal = :Goal', { Goal: data.Goal })
      .getOne();
  }

  async getReportsByGoalId(goalId: number) {
    return await this.reportRepository
      .createQueryBuilder('r')
      .where('r.Goal = :Goal', { Goal: goalId })
      .leftJoin('r.User', 'User')
      .leftJoin('r.Goal', 'Goal')
      .select(['r.reportId', 'r.reason', 'User.email', 'Goal.goalId'])
      .getManyAndCount();
  }
}
