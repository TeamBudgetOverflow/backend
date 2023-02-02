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
  Delete,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AddAccountDto } from './dto/addAccount.dto';
import { Response } from 'express';
import { BanksService } from 'src/banks/banks.service';
import { BalanceService } from 'src/balances/balances.service';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { AccessUserGoalDTO } from 'src/usergoal/dto/accessUserGoals.dto';
import { AuthGuard } from '@nestjs/passport';
import { HttpStatusCode } from 'axios';
import { ModifyUserInfoDTO } from 'src/user/dto/modifyUser.dto';

@Controller('/api/accounts')
export class AccountsController {
  constructor(
    private readonly accountService: AccountsService,
    private readonly balanceService: BalanceService,
    private readonly userGoalService: UserGoalService,
  ) {}

  @Post('/:userId/balance/external')
  async viewAccountBalance(@Body() userInfo, @Headers() headers) {
    const result = this.accountService.viewAccountBalance(userInfo, headers);
    return result;
  }

  // DB search
  @Get('/:accountId/users/:userId/balance')
  @UseGuards(AuthGuard('jwt'))
  async getAccountBalance(
    @Req() req,
    @Res() res,
    @Param('userId') targetUserId: number,
    @Param('accountId') accountId: number,
  ) {
    const userId = req.user;
    if (Number(targetUserId) === userId) {
      const result = await this.accountService.getAccountBalance(
        Number(accountId),
      );
      res.json(result);
    } else {
      throw new HttpException('User Does not exist', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/:userId')
  @UseGuards(AuthGuard('jwt'))
  async addAccount(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
    @Body() accountInfo: AddAccountDto,
  ) {
    const userId = req.user;
    const bank = accountInfo.bankId;
    if (Number(targetUserId) === userId) {
      const targetUserAccounts = await this.accountService.getAccounts(userId);
      const connectedAccounts = await this.accountService.getConnectedAccounts(
        userId,
      );

      if (targetUserAccounts.length > 0) {
        const { accountId, bank } = targetUserAccounts[0];
        const bankId = bank.id;
        if (connectedAccounts.includes(accountId)) {
          throw new HttpException(
            'No Account is available to connect',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          if (bankId !== 2) {
            const data = { userId, bank, ...accountInfo };
            const result = await this.accountService.addAccount(data);
            res.json({ accountId: result.accountId });
          } else {
            throw new HttpException(
              'Please Provide a Real Account (Not Manual)',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      } else {
        const data = { userId, bank };
        const result = await this.accountService.addAccount(data);
        res.json({ accountId: result.accountId });
      }
    } else {
      throw new HttpException('Not Authorized', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/:userId/manual')
  @UseGuards(AuthGuard('jwt'))
  async addManual(
    @Req() req,
    @Res() res,
    @Param('userId') targetUserId: number,
  ) {
    const userId = req.user;
    // const userId = 1;
    // const user = 1; - tested with the fixed user Id
    // const bank = 3; // would be different - talk with FE
    const bank = 2;
    if (Number(targetUserId) === userId) {
      const targetUserAccounts = await this.accountService.getManualAccounts(
        userId,
      );
      const connectedAccounts = await this.accountService.getConnectedAccounts(
        userId,
      );
      const trimmedAccounts = [];
      // filtering logic - if account is connected to the goal
      if (targetUserAccounts.length >= 10) {
        for (let i = 0; i < targetUserAccounts.length; i++) {
          const { accountId, bank } = targetUserAccounts[i];
          // console.log(bank.id);
          const bankId = bank.id;
          // console.log(connectedAccounts.includes(accountId));
          if (connectedAccounts.includes(accountId)) {
            continue;
          } else {
            if (bankId === 2) {
              trimmedAccounts.push(accountId);
              break;
            }
          }
        }
        res.json({ accountId: trimmedAccounts[0] });
      } else {
        const data = { userId, bank };
        const result = await this.accountService.addAccount(data);
        res.json({ accountId: result.accountId });
      }
    } else {
      throw new HttpException('Not Authorized', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/:accountId/users/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getAccountDetail(
    @Req() req,
    @Res() res,
    @Param('userId') targetUserId: number,
    @Param('accountId') accountId: number,
  ) {
    const userId = req.user;
    if (Number(targetUserId) === userId) {
      const targetAccount = this.accountService.getIndivAccount(accountId);
      res.json(targetAccount);
    } else {
      throw new HttpException('Not Authorized', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/:accountId/users/:userId')
  @UseGuards(AuthGuard('jwt'))
  async deleteAccount(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
    @Param('accountId') targetAccountId: number,
  ) {
    const userId = req.user;
    if (Number(targetUserId) === userId) {
      const connectedAccounts = await this.accountService.getConnectedAccounts(
        userId,
      );
      if (connectedAccounts.includes(Number(targetAccountId))) {
        throw new HttpException(
          'Cannot Delete the connected account',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const targ = await this.accountService.getIndivAccount(targetAccountId);
        if (!targ) {
          throw new HttpException(
            'Such Account Does Not Exist',
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.accountService.deleteAccount(targetAccountId);
        res.json({
          message: `AccountId ${targetAccountId} is successfully deleted`,
        });
      }
    } else {
      throw new HttpException('Not Authorized', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':userId')
  @UseGuards(AuthGuard('jwt'))
  async getAccounts(
    @Req() req,
    @Res() res: Response,
    @Param('userId') targetUserId: number,
  ) {
    const user = req.user;
    if (Number(targetUserId) === user) {
      const targetUserAccounts = await this.accountService.getAllAccounts(user);
      const connectedAccounts = await this.accountService.getConnectedAccounts(
        user,
      );
      const trimmedAccounts = [];
      for (let i = 0; i < targetUserAccounts.length; i++) {
        const { accountId, acctNo, bank } = targetUserAccounts[i];
        const bankId = bank.id;
        let connected = false;
        if (connectedAccounts.includes(accountId)) {
          connected = true;
        }
        trimmedAccounts.push({
          accountId,
          acctNo,
          bankId,
          connected,
        });
      }
      res.json({ data: trimmedAccounts });
    } else {
      throw new HttpException('Not Authorized', HttpStatus.BAD_REQUEST);
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
    const userId = req.user;
    const data: AccessUserGoalDTO = {
      userId,
      balanceId,
    };
    const findBalance = await this.userGoalService.findUser(data);
    if (findBalance.accountId.userId != userId) {
      throw new HttpException('접근 권한이 없습니다', HttpStatus.BAD_REQUEST);
    } else {
      if(findBalance.status === "in progress") {
        await this.balanceService.updateBalance(balanceId, current);
        res.json({ message: 'balance 수정 완료' });
      }else {
        throw new HttpException('수정 가능한 상태가 아닙니다.', HttpStatus.BAD_REQUEST);
      }
    }
  }
}
