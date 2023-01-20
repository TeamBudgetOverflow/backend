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
  Put,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { AddAccountDto } from './dto/addAccount.dto';
import { Response } from 'express';
import { BanksService } from 'src/banks/banks.service';
import { BalanceService } from 'src/balances/balances.service';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { AccessUserGoalDTO } from 'src/usergoal/dto/accessUserGoals.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('/api/accounts')
export class AccountsController {
  constructor(
    private readonly accountService: AccountsService,
    private readonly balanceService: BalanceService,
    private readonly userGoalService: UserGoalService,
  ) {}

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
  @UseGuards(AuthGuard('jwt'))
  async addAccount(
    @Req() req,
    @Res() res: Response,
    @Body() accountInfo: AddAccountDto,
  ) {
    try {
      const userId = req.user;
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
  @UseGuards(AuthGuard('jwt'))
  async addManual(
    @Req() req,
    @Res() res,
    @Param('userId') targetUserId: number,
  ) {
    try {
      const userId = req.user;
      // const userId = 1;
      // const user = 1; - tested with the fixed user Id
      const bank = 2; // would be different - talk with FE
      // const bank = 2; - tested with the fixed bank Id
      if (Number(targetUserId) === userId) {
        const targetUserAccounts = await this.accountService.getAccounts(
          userId,
        );
        console.log(targetUserAccounts);
        if (targetUserAccounts.length > 10) {
          for (let i = 0; i < targetUserAccounts.length; i++) {
            const { accountId, bank } = targetUserAccounts[i];
            const bankId = bank.id;
            if (bankId === 2) {
              const trimmedManual = { accountId };
              return res.status(200).json(trimmedManual);
            }
          }
        } else {
          const data = { userId, bank };
          const result = await this.accountService.addAccount(data);
          return res.status(200).json({ accountId: result.accountId });
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
  @UseGuards(AuthGuard('jwt'))
  async getAccounts(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
  ) {
    try {
      // const user = req.user;
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

  @Put('balance/:balanceId')
  @UseGuards(AuthGuard('jwt'))
  async updateBalance(
    @Req() req,
    @Param('balanceId') balanceId: number,
    @Body('value') current: number,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user;
      const data: AccessUserGoalDTO = {
        userId,
        balanceId,
      };
      const findBalance = await this.userGoalService.findUser(data);
      if (findBalance.accountId.userId != userId) {
        throw new HttpException('접근 권한이 없습니다', HttpStatus.BAD_REQUEST);
      } else {
        await this.balanceService.updateBalance(balanceId, current);
        return res.json({ message: 'balance 수정 완료' });
      }
    } catch (error) {
      console.log(error);
      return res.json({ errorMessage: 'balance 수정 실패' });
    }
  }
}
