import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from 'src/accounts/accounts.module';
import { GoalModule } from 'src/goal/goal.module';
import { Goals } from 'src/entity/goals';
import { Reports } from 'src/entity/reports';
import { Users } from 'src/entity/users';
import { SlackModule } from 'src/slack/slack.module';
import { UserModule } from 'src/user/user.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Goals, Reports]),
    forwardRef(() => UserModule),
    forwardRef(() => GoalModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => SlackModule),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
