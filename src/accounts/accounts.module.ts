import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { BalanceService } from 'src/balances/balances.service';
import { Accounts } from 'src/entity/accounts';
import { Users } from 'src/entity/users';
import { UserGoals } from 'src/entity/usergoals';
import { Balances } from 'src/entity/balances';
import { UserModule } from 'src/user/user.module';
import { GoalModule } from 'src/goal/goal.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Users, Accounts, UserGoals, Balances]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => GoalModule),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, BalanceService],
  exports: [AccountsService, BalanceService],
})
export class AccountsModule {}
