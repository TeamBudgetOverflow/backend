import * as dotenv from 'dotenv';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { GoalService } from './goal.service';
import { NaverAuthGuard } from '../auth/guard/naver-auth.guard';
import {
  Controller,
  Get,
  Req,
  Request,
  Res,
  HttpCode,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Post, Param, Body } from '@nestjs/common';
import { createHash } from 'crypto';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';
import { Goals } from '../models/goals';
dotenv.config();

@Controller('api/goals')
export class GoalController {
  constructor(private readonly goadlService: GoalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGoal(
    @Req() req,
    @Body() createGoalDTO: CreateGoalDTO,
    @Res() res: Response,
  ) {
    try {
      // 계좌 연결이 안되있으면 계좌 연결 진행할 것.
      const user = req.res.userId;
      console.log(typeof user);
      const data = { user, ...createGoalDTO };
      const result = await this.goadlService.createGoal(data);
      console.log(result);
      return res.status(200).json({ message: '목표 생성 완료' });
    } catch (error) {
      console.log(error);
    }
  }
}
