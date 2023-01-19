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

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, UserGoals, Goals,
    Accounts, Balances]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, AuthService, JwtService,
    GoalService, UserGoalService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
