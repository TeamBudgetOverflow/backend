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

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Goals, UserGoals, Balances]),
    forwardRef(() => AuthModule),
  ],
  providers: [
    GoalService,
    UserService,
    UserGoalService,
    AuthService,
    JwtService,
    BalanceService,
  ],
  controllers: [GoalController],
  exports: [GoalService],
})
export class GoalModule {}
