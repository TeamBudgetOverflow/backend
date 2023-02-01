import { forwardRef, Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { AuthModule } from '../auth/auth.module';
import { Users } from 'src/models/users';
import { Goals } from 'src/models/goals';
import { UserGoals } from 'src/models/usergoals';
import { Balances } from 'src/models/balances';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { BalanceService } from 'src/balances/balances.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { BadgeService } from 'src/badges/badge.service';
import { Accounts } from 'src/models/accounts';
import { HttpModule } from '@nestjs/axios';
import { CronModule } from 'src/cron/cron.module';
import { CronService } from 'src/cron/cron.service';
import { SchedulerRegistry } from 'src/cron/schedule.registry';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Goals, UserGoals, Balances, Accounts]),
    forwardRef(() => AuthModule),
    HttpModule,
  ],
  providers: [
    GoalService,
    UserService,
    UserGoalService,
    AuthService,
    JwtService,
    BalanceService,
    AccountsService,
    BadgeService,
    CronService,
    SchedulerRegistry,
  ],
  controllers: [GoalController],
  exports: [GoalService, UserGoalService],
})
export class GoalModule {}
