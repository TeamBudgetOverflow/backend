import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { AddAccountDto } from './dto/addAccount.dto';
import { Response } from 'express';

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
      return 'error';
    }
  }

  @Post('/:userId')
  @UseGuards(JwtAuthGuard)
  async addAccount(
    @Req() req,
    @Res() res: Response,
    @Body() accountInfo: AddAccountDto,
  ) {
    try {
      const user = req.res.userId;
      // const user = 1; - tested with the fixed user Id
      const bank = req.res.bankId;
      // const bank = 2; - tested with the fixed bank Id
      const data = { user, bank, ...accountInfo };
      const result = await this.accountService.addAccount(data);
      console.log(result);
      return res.status(200).json({ message: 'Account Added Successfully' });
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  async getAccounts(@Req() req, @Res() res: Response) {
    try {
      const user = req.res.userId;
      // const user = 1;
      const targetUserAccounts = await this.accountService.getAccounts(user);
      console.log(targetUserAccounts);
      return res.status(200).json(targetUserAccounts);
    } catch (error) {
      console.log(error);
    }
  }
}
