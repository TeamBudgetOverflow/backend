import { Body, Controller, Get, Param, Req, Res } from '@nestjs/common';
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
    try {
      const { bankCode, bankName } = await this.bankService.getBank(bankId);
      return res.status(200).json({
        bankId: Number(bankId),
        bankCode,
        bankName,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        errorMessage: 'No Such Bank Exists',
      });
    }
  }

  @Get()
  async getAllBanks(@Req() req, @Res() res: Response) {
    try {
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
      return res.status(200).json(bankList);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        errorMessage: 'Failed to get the list of banks',
      });
    }
  }
}
