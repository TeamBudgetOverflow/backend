import { forwardRef, Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { CronModule } from 'src/cron/cron.module';
import { UserModule } from 'src/user/user.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { Balances } from 'src/entity/balances';
import { UserGoals } from 'src/entity/usergoals';
import { Accounts } from 'src/entity/accounts';
import { Users } from 'src/entity/users';
import { Goals } from 'src/entity/goals';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Users, Goals, UserGoals, Balances, Accounts]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => CronModule),
    forwardRef(() => AccountsModule),
  ],
  providers: [GoalService, UserGoalService],
  controllers: [GoalController],
  exports: [GoalService, UserGoalService],
})
export class GoalModule {}
