import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadgeService } from 'src/badges/badge.service';
import { AuthModule } from '../auth/auth.module';
import { GoalModule } from 'src/goal/goal.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { Users } from 'src/models/users';
import { UserGoals } from 'src/models/usergoals';
import { Goals } from 'src/models/goals';
import { Accounts } from 'src/models/accounts';
import { Balances } from 'src/models/balances';
import { Badges } from 'src/models/badges';
import { UserBadges } from 'src/models/userbadges';


@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserGoals, Goals,
    Accounts, Balances, Badges, UserBadges]),
    forwardRef(() => AuthModule),
    forwardRef(() => GoalModule),
    forwardRef(() => AccountsModule),
  ],
  providers: [UserService, BadgeService],
  controllers: [UserController],
  exports: [UserService, BadgeService],
})
export class UserModule {}
