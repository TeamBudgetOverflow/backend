import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Accounts } from 'src/models/accounts';
import { Users } from 'src/models/users';
import { UserGoals } from 'src/models/usergoals';
import { Balances } from 'src/models/balances';
import { UserService } from 'src/user/user.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { BalanceService } from 'src/balances/balances.service';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { UserModule } from 'src/user/user.module';
import { GoalModule } from 'src/goal/goal.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Users, Accounts, UserGoals, Balances]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    GoalModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, BalanceService],
  exports: [AccountsService, BalanceService]
})
export class AccountsModule {}
