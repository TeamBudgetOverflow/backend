import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { BanksService } from './banks.service';
import { Response } from 'express';

@Controller('api/banks')
export class BanksController {
  constructor(private readonly bankService: BanksService) {}

  @Get(':bankId')
  async getBank(@Param('bankId') bankId: number) {
    const { bankCode, bankName } = await this.bankService.getBank(bankId);
    return {
      bankId: Number(bankId),
      bankCode,
      bankName,
    };
  }

  @Get()
  async getAllBanks() {
    const banks = await this.bankService.getAllBanks();
    const bankList = [];
    for (let i = 0; i < banks.length; i++) {
      const { id: bankId, bankCode, bankName } = banks[i];
      bankList.push({
        bankId,
        bankCode,
        bankName,
      });
    }
    return bankList;
  }
}
