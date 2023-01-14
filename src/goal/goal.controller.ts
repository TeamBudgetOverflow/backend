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
import { Post, Param, Body, Delete } from '@nestjs/common';
import { createHash } from 'crypto';
import { InputCreateGoalDTO } from '../goal/dto/inputCreateGoal.dto';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';
import { Goals } from '../models/goals';
import { UserGoalService } from '../usergoal/userGoal.service';
import { CreateUserGoalDTO } from '../usergoal/dto/createUserGoals.dto';

dotenv.config();

@Controller('api/goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly usergoalService: UserGoalService,
    ) {}

    // 목표 생성
    @Post()
    @UseGuards(JwtAuthGuard)
    async createGoal(
        @Req() req,
        @Body() createGoalDTO: InputCreateGoalDTO,
        @Res() res: Response) {
        try{
            const userId: number = req.res.userId;
            const createUserId: number = userId;
            const curCount: number = 1;
            // 1. 목표 생성
            let data: CreateGoalDTO = {userId, createUserId, curCount, ...createGoalDTO}
            const result = await this.goalService.createGoal(data);
            const goalId: number = result.goalId
            // 2. 내가 만든 목표 자동 참가
            let createUserGoalData: CreateUserGoalDTO = { userId, goalId };
            await this.usergoalService.joinGoal(createUserGoalData);
            // Transaction 적용 필요
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

    //목표 참가
    @Post(':goalId')
    @UseGuards(JwtAuthGuard)
    async joinGoal(
        @Req() req,
        @Param('goalId') goalId: number,
        @Res() res: Response){
        try{
            const userId = req.res.userId;
            // 1. 목표 참가자 맥시멈 숫자 확인 - goals DB
            const findGoal = await this.goalService.getGoalByGoalId(goalId);
            const goalMaxUser: number = findGoal.headCount;
            // 2. 현재 참가자 숫자 확인 - userGoals DB
            const joinUserCount = await this.usergoalService.getJoinUser(goalId);
            if(findGoal.headCount === goalMaxUser){
                // 에러 반환 - 참가 유저가 가득 찼습니다
            } else {
                // 동시성 문제에 대한 대비책 필요
                // transaction 적용 필요
                let createUserGoalData: CreateUserGoalDTO = { userId, goalId };
                await this.usergoalService.joinGoal(createUserGoalData);
                findGoal.headCount += 1;
                await this.goalService.updateGoal(goalId, findGoal.headCount);
            }
        }catch(error){
            console.log(error)
        }
    }

    // 목표 탈퇴
    // 목표 시작 전에만 가능함
    // @Delete(':goalId')
    // @UseGuards(JwtAuthGuard)
    // async exitGoal(
    //     @Req() req,
    //     @Param('goalId') goalId: number,
    //     @Res() res: Response ){
    //     try{
    //         const userId = req.res.userId;
    //         // 1. 참가한 유저인지 확인
    //         const 
    //     }catch(error){
    //         console.log(error);
    //     }
    // }
}
