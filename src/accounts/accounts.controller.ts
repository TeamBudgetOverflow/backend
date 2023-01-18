import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { AddAccountDto } from './dto/addAccount.dto';
import { Response } from 'express';
import { BanksService } from 'src/banks/banks.service';

@Controller('/api/accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Post('/:userId/balance')
  async viewAccountBalance(@Body() userInfo, @Headers() headers) {
    try {
      const result = this.accountService.viewAccountBalance(userInfo, headers);
      return result;
    } catch (err) {
      console.log(err);
      return 'Failed to get a balance';
    }
  }

  @Post('/:userId')
  // @UseGuards(JwtAuthGuard)
  async addAccount(
    @Req() req,
    @Res() res: Response,
    @Body() accountInfo: AddAccountDto,
  ) {
    try {
      const userId = req.res.userId;
      // const user = 1;
      // const user = 1; - tested with the fixed user Id
      const bank = accountInfo.bankId;
      // const bank = 2; - tested with the fixed bank Id
      const data = { userId, bank, ...accountInfo };
      await this.accountService.addAccount(data);
      return res.status(200).json({ message: 'Account Added Successfully' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        errorMessage: 'Failed to add an account',
      });
    }
  }

  @Post('/:userId/manual')
  // @UseGuards(JwtAuthGuard)
  async addManual(
    @Req() req,
    @Res() res,
    @Param('userId') targetUserId: number,
  ) {
    try {
      // const user = req.res.userId;
      const userId = 1;
      // const user = 1; - tested with the fixed user Id
      const bank = 3; // would be different - talk with FE
      // const bank = 2; - tested with the fixed bank Id
      if (Number(targetUserId) === userId) {
        const targetUserAccounts = await this.accountService.getAccounts(
          userId,
        );
        console.log(targetUserAccounts);
        if (targetUserAccounts.length > 0) {
          for (let i = 0; i < targetUserAccounts.length; i++) {
            const { accountId, bank } = targetUserAccounts[i];
            const bankId = bank.id;
            if (bankId === 3) {
              const trimmedManual = { accountId };
              return res.status(200).json(trimmedManual);
            }
          }
        } else {
          const data = { userId, bank };
          await this.accountService.addAccount(data);
          return res
            .status(200)
            .json({ message: 'Manual Account Added Successfully' });
        }
      } else {
        throw new Error('User Does not exist');
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        errorMessage: 'Failed to add an account',
      });
    }
  }

  @Get(':userId')
  // @UseGuards(JwtAuthGuard)
  async getAccounts(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
  ) {
    try {
      // const user = req.res.userId;
      console.log(typeof targetUserId);
      const user = 1;
      if (Number(targetUserId) === user) {
        const targetUserAccounts = await this.accountService.getAccounts(user);
        const trimmedAccounts = [];
        for (let i = 0; i < targetUserAccounts.length; i++) {
          const { accountId, acctNo, bank } = targetUserAccounts[i];
          const bankId = bank.id;
          if (bankId !== 3) {
            trimmedAccounts.push({
              accountId,
              acctNo,
              bankId,
            });
          }
        }
        return res.status(200).json(trimmedAccounts);
      } else {
        throw new Error('User Does not exist');
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        errorMessage: 'Failed to get accounts',
      });
    }
  }

  // @Get(':userId/manual')
  // // @UseGuards(JwtAuthGuard)
  // async getManual(
  //   @Req() req,
  //   @Res() res,
  //   @Param('userId') targetUserId: number,
  // ) {

  // }
}
