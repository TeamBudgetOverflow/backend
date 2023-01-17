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
}
