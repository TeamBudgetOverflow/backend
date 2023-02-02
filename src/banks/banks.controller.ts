import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { BanksService } from './banks.service';
import { Response } from 'express';

@Controller('api/banks')
export class BanksController {
  constructor(private readonly bankService: BanksService) {}

  @Get(':bankId')
  async getBank(
    @Req() req,
    @Param('bankId') bankId: number,
    @Res() res: Response,
  ) {
      const { bankCode, bankName } = await this.bankService.getBank(bankId);
      res.json({
        bankId: Number(bankId),
        bankCode,
        bankName,
      });
  }

  @Get()
  async getAllBanks(@Req() req, @Res() res: Response) {
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
      res.json(bankList);
  }
}
