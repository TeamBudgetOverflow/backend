import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reports } from 'src/models/reports';
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
    console.log(data);
    return await this.reportRepository
      .createQueryBuilder('r')
      .where('r.User = :User', { User: data.User })
      .andWhere('r.Goal = :Goal', { Goal: data.Goal })
      .getOne();
  }
}
