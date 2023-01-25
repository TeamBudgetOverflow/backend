import * as dotenv from 'dotenv';
import { Response } from 'express';
import { GoalService } from './goal.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { BalanceService } from 'src/balances/balances.service';
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
import { Post, Param, Body, Put, Patch, Delete } from '@nestjs/common';
import { CreateGoalDTO } from '../goal/dto/createGoal.dto';
import { InputUpdateGoalDTO } from '../goal/dto/inputUpdateGoal.dto';
import { InputCreateGoalDTO } from '../goal/dto/inputCreateGoal.dto';
import { AccessUserGoalDTO } from '../usergoal/dto/accessUserGoals.dto';
import { CreateUserGoalDTO } from '../usergoal/dto/createUserGoals.dto';
import { UpdateGoalDTO } from './dto/updateGoal.dto';
import { InitBalanceDTO } from 'src/balances/dto/initBalance.dto';
import { Connection } from 'typeorm';
import { Balances } from 'src/models/balances';
import { UserGoals } from 'src/models/usergoals';
import { AuthGuard } from '@nestjs/passport';

dotenv.config();

@Controller('api/goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly usergoalService: UserGoalService,
    private readonly balanceService: BalanceService,
    private readonly connection: Connection,
  ) {}

  // 목표 생성
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createGoal(
    @Req() req,
    @Body() createGoalDTO: InputCreateGoalDTO,
    @Res() res: Response,
  ) {
    const userId: number = req.user;
    const curCount = 1;

    const checkRegister: UserGoals = await this.usergoalService.findUser({ 
      accountId : createGoalDTO.accountId
      });
    if(checkRegister){
      throw new HttpException(
        '이미 목표에 연결된 계좌 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    let hashTag: string = '';
    for(let i = 0; i < createGoalDTO.hashTag.length ; i++){
      if(i == createGoalDTO.hashTag.length - 1){
        hashTag += createGoalDTO.hashTag[i];
      }else {
        hashTag += createGoalDTO.hashTag[i] + ",";
      }
    }
    let isPrivate = false;
    if(createGoalDTO.isPrivate){
      isPrivate = createGoalDTO.isPrivate;
    }
    // 1. 목표 생성
    const data: CreateGoalDTO = {
      isPrivate: isPrivate,
      userId,
      curCount,
      amount: createGoalDTO.amount,
      startDate: createGoalDTO.startDate,
      endDate: createGoalDTO.endDate,
      headCount: createGoalDTO.headCount,
      title: createGoalDTO.title,
      description: createGoalDTO.description,
      hashTag: hashTag,
      emoji: createGoalDTO.emoji
    };
    const result = await this.goalService.createGoal(data);
    const goalId: number = result.goalId;
    const accountId: number = createGoalDTO.accountId;
    const balanceData: InitBalanceDTO = {
      initial: 0,
      current: 0,
      chkType: "Direct Input"
    }
    const balanceCreate: Balances = await this.balanceService.initBalance(balanceData);
    const balanceId: number = balanceCreate.balanceId;
    // 2. 내가 만든 목표 자동 참가
    const createUserGoalData: CreateUserGoalDTO = {
      userId,
      goalId,
      accountId,
      balanceId,
    };
    await this.usergoalService.joinGoal(createUserGoalData);
    // Transaction 적용 필요
    res.json({ goalId, message: '목표 생성 완료' });
  }

  //목표 참가
  @Post('join/:goalId')
  @UseGuards(AuthGuard('jwt'))
  async joinGoal(
    @Req() req,
    @Body('accountId') accountId: number,
    @Param('goalId') goalId: number,
    @Res() res: Response,
  ) {
    const userId = req.user;
    const data = {
      accountId: accountId
    };
    const checkRegister: UserGoals = await this.usergoalService.findUser(data);
    if(checkRegister){
      throw new HttpException(
        '이미 목표에 연결된 계좌 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 목표 참가자 맥시멈 숫자 확인 - goals DB
    const findGoal = await this.goalService.getGoalByGoalId(goalId);
    const goalMaxUser: number = findGoal.headCount;
    if (findGoal.curCount === goalMaxUser) {
      // 에러 반환 - 참가 유저가 가득 찼습니다
      throw new HttpException(
        '모집이 완료되었습니다.',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // 동시성 문제에 대한 대비책 필요
      // transaction 적용 필요
      const balanceData: InitBalanceDTO = {
        initial: 0,
        current: 0,
        chkType: "Direct Input"
      }
      const balanceCreate: Balances = await this.balanceService.initBalance(balanceData);
      const balanceId: number = balanceCreate.balanceId;
      const createUserGoalData: CreateUserGoalDTO = {
        userId,
        goalId,
        accountId,
        balanceId,
      };
      await this.usergoalService.joinGoal(createUserGoalData);
      findGoal.curCount += 1;
      await this.goalService.updateGoalCurCount(goalId, findGoal.curCount);
      res.json({ message: '참가가 완료되었습니다.' });
    }
  }

  // 목표 전체 조회
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllGoal(@Res() res: Response) {
    // 무한 스크롤 고려
    const sortResult = await this.goalService.getAllGoals();
    const result = [];
    for (let i = 0; i < sortResult.length; i++) {
      const { userId, nickname } = sortResult[i].userId;
      const hashTag = sortResult[i].hashTag.split(",");
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
        hashTag: hashTag,
        emoji: sortResult[i].emoji,
        description: sortResult[i].description,
        createdAt: sortResult[i].createdAt,
        updatedAt: sortResult[i].updatedAt,
      });
    }
    res.json({ result });
  }

  // 목표 상세 조회
  @Get(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async getGoalDetail(
    @Req() req,
    @Param('goalId') goalId: number,
    @Res() res: Response,
  ) {
    const findGoal = await this.goalService.getGoalDetail(goalId);

    const joinUser = await this.usergoalService.getJoinUser(goalId);
    const member = [];
    for(let i = 0; i < joinUser.length; i++){
      const { userId: memberUserId, 
              nickname: memberNickname,
              image: memberImage } = joinUser[i].userId
      const { current } = joinUser[i].balanceId
      const { accountId } = joinUser[i].accountId
      let attainment: number = 0;
      if(current !== 0){
        attainment = current/findGoal.amount * 100;
      }
      member.push({
        userId: memberUserId,
        nickname: memberNickname,
        image: memberImage,
        attainment: attainment,
        accountId: accountId
      })
    }

    const { userId, nickname } = findGoal.userId;
    const hashTag = findGoal.hashTag.split(",");
    const result = [];
    result.push({
      goalId: findGoal.goalId,
      userId: userId,
      nickname: nickname,
      amount: findGoal.amount,
      curCount: findGoal.curCount,
      headCount: findGoal.headCount,
      startDate: findGoal.startDate,
      endDate: findGoal.endDate,
      title: findGoal.title,
      hashTag: hashTag,
      emoji: findGoal.emoji,
      description: findGoal.description,
      createdAt: findGoal.createdAt,
      updatedAt: findGoal.updatedAt,
      members: member
    });
  
    res.json({ result: result });
  }

  // 목표 수정
  @Put(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async updateGoal(
    @Req() req,
    @Param('goalId') goalId: number,
    @Body() inputUpdateGoalDTO: InputUpdateGoalDTO,
    @Res() res: Response,
  ) {
    const userId: number = req.user;
    const findGoal = await this.goalService.getGoalByGoalId(goalId);
    if(userId != findGoal.userId.userId) {
      throw new HttpException(
        '접근할 수 없는 권한입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    let hashTag: string = '';
    for(let i = 0; i < inputUpdateGoalDTO.hashTag.length ; i++){
      if(i == inputUpdateGoalDTO.hashTag.length - 1){
        hashTag += inputUpdateGoalDTO.hashTag[i];
      }else {
        hashTag += inputUpdateGoalDTO.hashTag[i] + ",";
      }
    }
    let isPrivate = false;
    if(inputUpdateGoalDTO.isPrivate){
      isPrivate = inputUpdateGoalDTO.isPrivate;
    }
    let data: UpdateGoalDTO = {
      isPrivate: isPrivate,
      title: inputUpdateGoalDTO.title,
      description: inputUpdateGoalDTO.description,
      amount: inputUpdateGoalDTO.amount,
      startDate: inputUpdateGoalDTO.startDate,
      endDate: inputUpdateGoalDTO.endDate,
      hashTag: hashTag,
      emoji: inputUpdateGoalDTO.emoji,
      headCount: inputUpdateGoalDTO.headCount,
    }
    await this.goalService.updateGoal(goalId, data);
    res.json({ message: '목표 수정 완료' });
  }

  // 목표 탈퇴
  // 목표 시작 전에만 가능함
  @Delete('exit/:goalId')
  @UseGuards(AuthGuard('jwt'))
  async exitGoal(
    @Req() req,
    @Param('goalId') goalId: number,
    @Res() res: Response,
  ) {
    const userId: number = req.user;
    // getGoalDetail 가져오기
    const findGoal = await this.goalService.getGoalByGoalId(goalId);
    if (userId === findGoal.userId.userId) {
      // 해당 부분 에러날 수 있음 확인할 것
      // if 개설자 본인일 경우 에러 리턴
      throw new HttpException(
        '접근할 수 없는 권한입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 1. 참가한 유저인지 확인
    const accessUserGoalData: AccessUserGoalDTO = { userId, goalId };
    const find = await this.usergoalService.findUser(accessUserGoalData);
    if (find == null) {
      // error - 참가하지 않은 유저입니다.
      throw new HttpException('참가하지 않았습니다.', HttpStatus.BAD_REQUEST);
    } else {
      // 중간 테이블 삭제
      await this.usergoalService.exitGoal(accessUserGoalData);
      // 참가자 숫자 변동
      findGoal.headCount -= 1;
      await this.goalService.updateGoalCurCount(goalId, findGoal.headCount);
      res.json({ message: "목표 탈퇴 완료" });
    }
  }

  // 목표 삭제
  @Delete(':goal')
  @UseGuards(AuthGuard('jwt'))
  async deleteGoal(
    @Req() req,
    @Param('goalId') goalId: number,
    @Res() res: Response,
  ) {
    const userId: number = req.user;
    const find = await this.goalService.getGoalDetail(goalId);
    // 참가자가 2명이상이면 삭제 불가능
    if (find.curCount >= 2) {
      throw new HttpException('참가한 유저가 있어 삭제가 불가능합니다.', 400);
    } else {
      const accessUserGoalData: AccessUserGoalDTO = { userId, goalId };
      await this.usergoalService.exitGoal(accessUserGoalData);
      await this.goalService.deleteGoal(goalId);
      res.json({ message: '목표 삭제 완료' });
    }
  }
}
