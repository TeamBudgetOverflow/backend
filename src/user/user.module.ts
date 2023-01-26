import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { Users } from 'src/models/users';
import { UserGoals } from 'src/models/usergoals';
import { Goals } from 'src/models/goals';
import { Accounts } from 'src/models/accounts';
import { Balances } from 'src/models/balances';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { GoalService } from 'src/goal/goal.service';
import { BadgeService } from 'src/badges/badge.service';
import { Badges } from 'src/models/badges';
import { UserBadges } from 'src/models/userbadges';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserGoals, Goals,
    Accounts, Balances, Badges, UserBadges]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, AuthService, JwtService,
    GoalService, UserGoalService, BadgeService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
