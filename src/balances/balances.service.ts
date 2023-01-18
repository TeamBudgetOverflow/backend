
import { Body, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Balances } from 'src/models/balances';
import { InitBalanceDTO } from './dto/initBalance.dto';


@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balances)
    private balancesRepository: Repository<Balances>,
  ) {}

    // init balance value
    async initBalance(balanceData: InitBalanceDTO): Promise<Balances>{
        return await this.balancesRepository.save(balanceData);
    }

    // update balance 
    async updateBalance(balanceId: number, current: number){
      await this.balancesRepository.update({balanceId}, {current});
    }
}