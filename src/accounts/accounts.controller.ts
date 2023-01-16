import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { AddAccountDto } from './dto/addAccount.dto';
import { Response } from 'express';

@Controller('/api/accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Post('account/view')
  async viewAccountBalance(@Body() userInfo, @Headers() headers) {
    try {
      const result = this.accountService.viewAccountBalance(userInfo, headers);
      return result;
    } catch (err) {
      console.log(err);
      return 'error';
    }
  }

  @Post('/addaccount')
//   @UseGuards(JwtAuthGuard)
  async addAccount(
    @Req() req,
    @Res() res: Response,
    @Body() accountInfo: AddAccountDto,
  ) {
    try {
      //   const user = req.res.userId;
      const user = 1;
      console.log(user);
      const data = { user, ...accountInfo };
      const result = await this.accountService.addAccount(data);
      console.log(result);
      return res.status(200).json({ message: 'Placeholder' });
    } catch (error) {
      console.log(error);
    }
  }
}
