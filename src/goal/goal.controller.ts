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
    private readonly goalService: GoalService,
    ) {}

    // 목표 생성
    @Post()
    @UseGuards(JwtAuthGuard)
    async createGoal(
        @Req() req,
        @Body() createGoalDTO: CreateGoalDTO,
        @Res() res: Response) {
        try{
            const userId = req.res.userId;
            const data = {userId, ...createGoalDTO}
            // 생성이 안되도 에러 반환, 생성이 되어도 리턴값이 필요하지 않은것이 아닌지
            const result = await this.goalService.createGoal(data);
            return res
                .status(200)
                .json({ message: "목표 생성 완료"})
        }catch(error){
            console.log(error);
            return res
                .status(400)
                .json({ errorMessage: "목표 생성 실패" })
        }
    }

    // 목표 전체 보기
    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllGoal(
        @Res() res: Response){
        try{
            const result = await this.goalService.getAllGoals();
            return res
                .status(200)
                .json({ result })
        }catch(error){
            console.log(error);
            return res
                .status(400)
                .json({ errorMessage: "알 수 없는 에러" })
        }
    }

    // 목표 참가
    // @Post(':goalId')
    // @UseGuards(JwtAuthGuard)
    // async joinGoal(
    //     @Req() req,
    //     @Param('goalId') goalId: number,
    //     @Res() res: Response){
    //     try{
    //         const userId = req.res.userId;
    //         // 1. 목표 참가자 맥시멈 숫자 확인 - goals DB
    //         const getGoal = await this.goalService.getGoalByGoalId(goalId);
    //         const goalMaxUser: number = getGoal.headCount;
    //         // 2. 현재 참가자 숫자 확인 - userGoals DB
    //         const joinUser = await this.goalService.joinUserGoal(goalId);
    //         // 3. 마지막 한자리 -> 모집 상태 완료로 만들어야함
    //         // 목표인원이 모두 다 차면 프론트에서 막을 수 있지만(접근 제한)
    //         // 백엔드도 막아야하는데 Goals Table에 추가적인 Column을 만들지
    //         // ex) isDone
    //         // 4. 동시성 문제에 대한 대비책 필요
    //         const result = await this.goalService.joinGoal(userId, goalId);
    //     }catch(error){
    //         console.log(error)

    //     }
    // }

}
