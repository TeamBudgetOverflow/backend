import { Body, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Balances } from 'src/entity/balances';
import { InitBalanceDTO } from './dto/initBalance.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balances)
    private balancesRepository: Repository<Balances>,
  ) {}

  // init balance value
  async initBalance(balanceData: InitBalanceDTO): Promise<Balances> {
    return await this.balancesRepository.save(balanceData);
  }

  // update balance
  async updateBalance(
    balanceId: number,
    current: number,
    manager?: EntityManager,
  ) {
    if (manager) {
      await manager.update(Balances, { balanceId }, { current });
    } else {
      await this.balancesRepository.update({ balanceId }, { current });
    }
  }

  // delete balance
  async deleteBalance(balanceId: number, manager?: EntityManager) {
    if (manager) {
      await manager.remove({ balanceId });
    } else {
      await this.balancesRepository.delete({ balanceId });
    }
  }
}
