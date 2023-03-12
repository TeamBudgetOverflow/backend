import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadgeService } from 'src/badges/badge.service';
import { AuthModule } from '../auth/auth.module';
import { GoalModule } from 'src/goal/goal.module';
import { AccountsModule } from 'src/accounts/accounts.module';
import { Users } from 'src/entity/users';
import { UserGoals } from 'src/entity/usergoals';
import { Goals } from 'src/entity/goals';
import { Accounts } from 'src/entity/accounts';
import { Balances } from 'src/entity/balances';
import { Badges } from 'src/entity/badges';
import { UserBadges } from 'src/entity/userbadges';

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
    forwardRef(() => AuthModule),
    forwardRef(() => GoalModule),
    forwardRef(() => AccountsModule),
  ],
  providers: [UserService, BadgeService],
  controllers: [UserController],
  exports: [UserService, BadgeService],
})
export class UserModule {}
