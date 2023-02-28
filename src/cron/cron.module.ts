import { forwardRef, Module } from '@nestjs/common';
import { SchedulerRegistry } from './schedule.registry';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from 'src/user/user.module';
import { GoalModule } from 'src/goal/goal.module';
import { Users } from 'src/entity/users';
import { Goals } from 'src/entity/goals';
import { UserGoals } from 'src/entity/usergoals';
import { Accounts } from 'src/entity/accounts';
import { Balances } from 'src/entity/balances';
import { Badges } from 'src/entity/badges';
import { UserBadges } from 'src/entity/userbadges';
import { ReportsModule } from 'src/reports/report.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      UserGoals,
      Goals,
      Accounts,
      Balances,
      Badges,
      UserBadges,
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() => GoalModule),
    forwardRef(() => UserModule),
    forwardRef(() => ReportsModule),
  ],
  providers: [CronService, SchedulerRegistry],
  controllers: [],
  exports: [CronService, SchedulerRegistry],
})
export class CronModule {}
