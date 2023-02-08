import { forwardRef, Module } from '@nestjs/common';
import { SchedulerRegistry } from './schedule.registry';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from 'src/user/user.module';
import { GoalModule } from 'src/goal/goal.module';
import { Users } from 'src/models/users';
import { Goals } from 'src/models/goals';
import { UserGoals } from 'src/models/usergoals';
import { Accounts } from 'src/models/accounts';
import { Balances } from 'src/models/balances';
import { Badges } from 'src/models/badges';
import { UserBadges } from 'src/models/userbadges';
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
  controllers: [CronController],
  exports: [CronService, SchedulerRegistry],
})
export class CronModule {}
