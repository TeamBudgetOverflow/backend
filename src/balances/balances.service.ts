import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { Balances } from 'src/entity/balances';
import { InitBalanceDTO } from './dto/initBalance.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balances)
    private balancesRepository: Repository<Balances>,
  ) {}

  // init balance value
  async initBalance(
    balanceData: InitBalanceDTO,
    queryRunner: QueryRunner,
  ): Promise<Balances> {
    const balance = new Balances();
    balance.initial = balanceData.initial;
    balance.chkType = balanceData.chkType;
    balance.current = balanceData.current;
    return await queryRunner.manager.getRepository(Balances).save(balance);
  }

  // update balance
  async updateBalance(
    balanceId: number,
    current: number,
    queryRunner?: QueryRunner,
  ) {
    if (queryRunner) {
      await queryRunner.manager.update(Balances, { balanceId }, { current });
    } else {
      await this.balancesRepository.update({ balanceId }, { current });
    }
  }

  // delete balance
  async deleteBalance(balanceId: number, queryRunner: QueryRunner) {
    await queryRunner.manager.remove({ balanceId });
  }
}
