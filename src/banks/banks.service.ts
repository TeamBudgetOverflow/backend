import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Banks } from 'src/entity/banks';
import { Repository } from 'typeorm';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Banks)
    private readonly bankRepository: Repository<Banks>,
  ) {}
  async getBank(bankId) {
    const { bankCode, bankName } = await this.bankRepository.findOne({
      where: { id: bankId },
    });
    if (!bankCode) {
      return;
    }
    return { bankId, bankCode, bankName };
  }
  async getAllBanks() {
    const banks: Banks[] = await this.bankRepository.find({
      order: { id: 'ASC' },
    });
    return banks;
  }
}
