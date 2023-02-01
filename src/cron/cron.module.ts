import { forwardRef, Module } from '@nestjs/common';
import { Goals } from 'src/models/goals';
import { UserGoals } from 'src/models/usergoals';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGoalService } from '../usergoal/userGoal.service';
import { HttpModule } from '@nestjs/axios';
import { CronService } from './cron.service';
import { GoalService } from 'src/goal/goal.service';
import { ScheduleModule } from '@nestjs/schedule';
import { GoalModule } from 'src/goal/goal.module';
import { SchedulerRegistry } from './schedule.registry';
import { CronController } from './cron.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goals]),
    ScheduleModule.forRoot(),
    GoalModule,
  ],
  providers: [
    CronService,
    SchedulerRegistry,
  ],
  controllers: [CronController],
  exports: [CronService, SchedulerRegistry],
})
export class CronModule {}