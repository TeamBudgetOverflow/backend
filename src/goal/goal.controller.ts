import * as dotenv from "dotenv";
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
  constructor(
    private readonly goadlService: GoalService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async createGoal(
        @Req() req,
        @Body() createGoalDTO: CreateGoalDTO,
        @Res() res: Response) {
        try{
            const userId = req.res.userId;
            const data = {userId, ...createGoalDTO}
            const result = await this.goadlService.createGoal(data);
            return res
                .status(200)
                .json({ message: "목표 생성 완료"})
        }catch(error){
            console.log(error);
        }
    }

}
