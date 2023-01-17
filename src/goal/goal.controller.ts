import * as dotenv from 'dotenv';
import { Response } from 'express';
import { GoalService } from './goal.service';
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
import { Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { InputCreateGoalDTO } from '../goal/dto/inputCreateGoal.dto';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';
import { UserGoalService } from '../usergoal/userGoal.service';
import { AccessUserGoalDTO } from '../usergoal/dto/accessUserGoals.dto';
import { CreateUserGoalDTO } from '../usergoal/dto/createUserGoals.dto';
import { Connection } from 'typeorm'

dotenv.config();

@Controller('api/goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly usergoalService: UserGoalService,
    private readonly connection: Connection
    ) {}

    // 목표 생성
    @Post()
    @UseGuards(JwtAuthGuard)
    async createGoal(
        @Req() req,
        @Body() createGoalDTO: InputCreateGoalDTO,
        @Res() res: Response) {
        // const queryRunner = this.connection.createQueryRunner();
        // await queryRunner.connect();
        // await queryRunner.startTransaction()
        try{
            const userId: number = req.res.userId;
            const curCount: number = 1;

            // 1. 목표 생성
            let data: CreateGoalDTO = { 
                userId, curCount, 
                amount: createGoalDTO.amount, 
                startDate: createGoalDTO.startDate,
                endDate: createGoalDTO.endDate, 
                headCount: createGoalDTO.headCount, 
                title: createGoalDTO.title,
                description: createGoalDTO.description,
                hashTag: createGoalDTO.hashTag,
            };
            const result = await this.goalService.createGoal(data);
            const goalId: number = result.goalId
            const accountId: number = createGoalDTO.accountId;
            // 2. 내가 만든 목표 자동 참가
            let accessUserGoalData: CreateUserGoalDTO = { userId, goalId, accountId };
            await this.usergoalService.joinGoal(accessUserGoalData);
            // Transaction 적용 필요
            res.json({ message: "목표 생성 완료"})
        }catch(error){
            console.log(error);
            res.json({ errorMessage: "목표 생성 실패" })
        }
    }

    // 목표 전체 조회
    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllGoal(
        @Res() res: Response){
        try{
            // 페이지네이션 고려
            const sortResult = await this.goalService.getAllGoals();
            const result = [];
            for(let i = 0; i < result.length; i++) {
                const { userId, nickname } = sortResult[i].userId;
                result.push({
                    goalId: sortResult[i].goalId,
                    userId: userId,
                    nickname: nickname,
                    amount: sortResult[i].amount,
                    curCount: sortResult[i].curCount,
                    headCount: sortResult[i].headCount,
                    startDate: sortResult[i].startDate,
                    endDate: sortResult[i].endDate,
                    title: sortResult[i].title,
                    hashTag: sortResult[i].hashTag,
                    createdAt: sortResult[i].createdAt,
                    updatedAt: sortResult[i].updatedAt,
                })
            }
            res.json({ result })
        }catch(error){
            console.log(error);
            res.json({ errorMessage: "알 수 없는 에러" })
        }
    }

    //목표 참가
    @Post(':goalId')
    @UseGuards(JwtAuthGuard)
    async joinGoal(
        @Req() req,
        @Body('accountId') accountId: number,
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
                throw new HttpException("모집이 완료되었습니다.", HttpStatus.BAD_REQUEST);
            } else {
                // 동시성 문제에 대한 대비책 필요
                // transaction 적용 필요
                let createUserGoalData: CreateUserGoalDTO = { userId, goalId, accountId };
                await this.usergoalService.joinGoal(createUserGoalData);
                findGoal.headCount += 1;
                await this.goalService.updateGoalCurCount(goalId, findGoal.headCount);
                res.json({ message: "참가가 완료되었습니다."});
            }
        }catch(error){
            console.log(error)
            res.json({ errorMessage: "알 수 없는 에러입니다."});
        }
    }

    // 목표 탈퇴
    // 목표 시작 전에만 가능함
    @Delete('exit/:goalId')
    @UseGuards(JwtAuthGuard)
    async exitGoal(
        @Req() req,
        @Param('goalId') goalId: number,
        @Res() res: Response ){
        try{
            const userId: number= req.res.userId;
            // getGoalDetail 가져오기
            const findGoal = await this.goalService.getGoalByGoalId(goalId);
            if(userId === findGoal.userId.userId){  // 해당 부분 에러날 수 있음 확인할 것
                // if 개설자 본인일 경우 에러 리턴
                throw new HttpException('접근할 수 없는 권한입니다.', HttpStatus.BAD_REQUEST);
            }
            // 1. 참가한 유저인지 확인
            let accessUserGoalData: AccessUserGoalDTO = { userId, goalId };
            const find = await this.usergoalService.findUser(accessUserGoalData);
            if(find == null){
                // error - 참가하지 않은 유저입니다.
                throw new HttpException("참가하지 않았습니다.", HttpStatus.BAD_REQUEST);
            } else {
                // 중간 테이블 삭제
                await this.usergoalService.exitGoal(accessUserGoalData);
                // 참가자 숫자 변동
                const findGoal = await this.goalService.getGoalByGoalId(goalId);
                findGoal.headCount -= 1;
                await this.goalService.updateGoalCurCount(goalId, findGoal.headCount);
            }
        }catch(error){
            console.log(error);
            res.json({ errorMessage: "알 수 없는 에러입니다." })
        }
    }

    // 목표 삭제
    @Delete(':goal')
    @UseGuards(JwtAuthGuard)
    async deleteGoal(
        @Req() req,
        @Param('goalId') goalId: number,
        @Res() res: Response){
        try{
            const userId: number= req.res.userId;
            const find = await this.goalService.getGoalDetail(goalId);
            // 참가자가 2명이상이면 삭제 불가능
            if(find.curCount >= 2){
                throw new HttpException('참가한 유저가 있어 삭제가 불가능합니다.', 400)
            }else {
                await this.goalService.deleteGoal(goalId);
                let accessUserGoalData: AccessUserGoalDTO = { userId, goalId };
                await this.usergoalService.exitGoal(accessUserGoalData);
                res.json({ message: "목표 삭제 완료" });
            }
        }catch(error){
            console.log(error);
            res.json({ errorMessage: "목표 삭제 실패" });
        }
    }

}
