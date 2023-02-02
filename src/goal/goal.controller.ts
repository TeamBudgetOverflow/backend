import * as dotenv from 'dotenv';
import { Response } from 'express';
import { GoalService } from './goal.service';
import { UserGoalService } from '../usergoal/userGoal.service';
import { BalanceService } from 'src/balances/balances.service';
import { BadgeService } from 'src/badges/badge.service';
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
import { Post, Param, Query, Body, Put, Patch, Delete } from '@nestjs/common';
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
import { AccountsService } from 'src/accounts/accounts.service';
import { GetBadgeDTO } from 'src/badges/dto/getBadge.dto';

dotenv.config();

@Controller('api/goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly usergoalService: UserGoalService,
    private readonly balanceService: BalanceService,
    private readonly accountService: AccountsService,
    private readonly badgeService: BadgeService,
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
      accountId : createGoalDTO.accountId,
      userId,
      });
    if(checkRegister){
      throw new HttpException(
        '이미 목표에 연결된 계좌 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 시작 날짜 > 끝 날짜 | 시작 날짜 = 오늘 혹은 과거
    // startDate는 오늘이 될 수 없음. 이 부분에 대한 세부 로직 필요
    if(new Date(createGoalDTO.startDate) > new Date(createGoalDTO.endDate) /*||
      (new Date(createGoalDTO.startDate) < new Date())*/ ){
      throw new HttpException(
        'Date 설정 오류',
        HttpStatus.BAD_REQUEST,
      );
    }

    // hashTag : Array -> String 변환
    let hashTag: string = '';
    for(let i = 0; i < createGoalDTO.hashTag.length ; i++){
      if(i == createGoalDTO.hashTag.length - 1){
        hashTag += createGoalDTO.hashTag[i];
      }else {
        hashTag += createGoalDTO.hashTag[i] + ",";
      }
    }

    // isPrivate default Value = false
    let isPrivate = false;
    if(createGoalDTO.isPrivate){
      isPrivate = createGoalDTO.isPrivate;
    }

    const pastCreateGoalData = await this.usergoalService.getGoalByUserId(userId);
    let personalCount: number = 0;
    let groupCount: number = 0;
    for(let i=0; i<pastCreateGoalData.length; i++) { 
      // 생성자 본인에 대한 데이터 필터링
      if(pastCreateGoalData[i].userId.userId == userId){
        if(pastCreateGoalData[i].goalId.headCount === 1) personalCount += 1;
        else groupCount += 1;
      }
    }
    let badgeId: number;
    // 개인 목표 - status: 진행중proceeding
    // 팀 목표 - status: 모집중recruit
    let status: string;
    if(createGoalDTO.headCount === 1){
      status = "proceeding";
      if(personalCount === 0){  // 개인 목표 첫 생성 뱃지 획득
        badgeId = 1;
        let data: GetBadgeDTO = {User: userId, Badges: badgeId};
        await this.badgeService.getBadge(data);
      }
    }else {
      status = "recruit";
      if(groupCount === 0){   // 그룹 목표 첫 생성 뱃지 획득
        badgeId = 4;
        let data: GetBadgeDTO = {User: userId, Badges: badgeId};
        await this.badgeService.getBadge(data);
      }
    }
    const end: Date = new Date(createGoalDTO.endDate);
    const start: Date = new Date(createGoalDTO.startDate);
    const period: number = (end.getTime() - start.getTime()) / (1000 * 60 *60 *24);

    // 목표 생성 데이터
    const data: CreateGoalDTO = {
      isPrivate: isPrivate,
      userId,
      curCount,
      amount: createGoalDTO.amount,
      startDate: start,
      endDate: end,
      period: period,
      status: status,
      headCount: createGoalDTO.headCount,
      title: createGoalDTO.title,
      description: createGoalDTO.description,
      hashTag: hashTag,
      emoji: createGoalDTO.emoji
    };

    const result = await this.goalService.createGoal(data);
    const goalId: number = result.goalId;
    const accountId: number = createGoalDTO.accountId;
    // update account field 'assigned' to true
    await this.accountService.updateAccountAssignment(accountId);
    const balanceData: InitBalanceDTO = {
      initial: 0,
      current: 0,
      chkType: "Direct Input"
    }
    const balanceCreate: Balances = await this.balanceService.initBalance(balanceData);
    const balanceId: number = balanceCreate.balanceId;
    let userGoalStatus: string;
    if(result.headCount === 1) userGoalStatus = "in progress"
    else userGoalStatus = "pending"
    // 내가 만든 목표 자동 참가
    const createUserGoalData: CreateUserGoalDTO = {
      userId,
      goalId,
      accountId,
      balanceId,
      status: userGoalStatus,
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
      accountId: accountId,
      userId
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
      // update account field 'assigned' to true
      await this.accountService.updateAccountAssignment(accountId);
      const balanceData: InitBalanceDTO = {
        initial: 0,
        current: 0,
        chkType: "Direct Input"
      }
      const balanceCreate: Balances = await this.balanceService.initBalance(balanceData);
      const balanceId: number = balanceCreate.balanceId;
      let status: string = "pending";
      const createUserGoalData: CreateUserGoalDTO = {
        userId,
        goalId,
        accountId,
        balanceId,
        status,
      };
      await this.usergoalService.joinGoal(createUserGoalData);
      findGoal.curCount += 1;
      await this.goalService.updateGoalCurCount(goalId, findGoal.curCount);
      res.json({ message: '참가가 완료되었습니다.' });
    }
  }

  // 목표 검색
  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  async searchGoal(
    @Query() paginationQuery,
    @Res() res: Response){
      let { keyword, sortby, orderby, status, min, max, page } = paginationQuery;
      let sortOby = '';
      //sortBy가 비어있으면 생성 시간순으로 분류
      if(!sortby) sortOby = "g.createdAt"
      else {
        switch (sortby) {
          // 정렬방식은 status - 진행중/모집중 - default: total
          // sortBy - 목표금액amount / 모집인원member / 목표기간period
          // orderBy - ASC(오름), DESC(내림)
          case "amount":
            sortOby = "g.amount"
            if(!max) max = 70000;
            break;
          case "member":
            sortOby = "g.headCount"
            if(!max) max = 10;
            break;
          case "period":
            sortOby = "g.period"
            if(!max) max = 7;
            break;
          default:
            sortOby = "g.createdAt"
            break;
        }
      }
      if(!min) min = 0;
      if(!orderby) orderby = "DESC";

      let statuses: string[];
      if(status === "recruit") statuses = ["recruit"]
      else if(status === "proceeding") statuses = ["proceeding"]
      else statuses = ["recruit", "proceeding"]

      const take: number = 5;
      if(!page) page = 1;

      let searchResult;
      let count: number;
      if(orderby === "ASC" && !(sortOby === "g.createdAt")) {
        [searchResult, count] = await this.goalService.searchGoal(
          keyword, sortOby, statuses, min, max, orderby, take, page
          );
      }else if(orderby === "DESC" && !(sortOby === "g.createdAt")){
        // orderBy 설정이 되어있지 않으면 기본적으로 내림차순
        [searchResult, count] = await this.goalService.searchGoal(
          keyword, sortOby, statuses, min, max, orderby, take, page
          );
      }else {
        // sortby와 max 가 둘 다 없는 경우
        // sortby : createdAt / max : undefined
        [searchResult, count] = await this.goalService.searchGoalNotValue(
          keyword, sortOby, statuses, orderby, take, page
          );
      }

      const result = [];
      for (let i = 0; i < searchResult.length; i++) {
        const { userId, nickname } = searchResult[i].userId;
        const hashTag = searchResult[i].hashTag.split(",");
        result.push({
          goalId: searchResult[i].goalId,
          userId: userId,
          nickname: nickname,
          amount: searchResult[i].amount,
          curCount: searchResult[i].curCount,
          headCount: searchResult[i].headCount,
          startDate: searchResult[i].startDate,
          endDate: searchResult[i].endDate,
          period: searchResult[i].period,
          status: searchResult[i].status,
          title: searchResult[i].title,
          hashTag: hashTag,
          emoji: searchResult[i].emoji,
          description: searchResult[i].description,
          createdAt: searchResult[i].createdAt,
          updatedAt: searchResult[i].updatedAt,
        });
      }
      let countPage: number = Math.ceil(count/take);
      let isLastPage: boolean;
      if(page == countPage) isLastPage = true;
      else isLastPage = false;
      res.json({ result: result, isLastPage, count });
  }

  // 목표 전체 조회
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllGoal(
    @Query('page') page: number,
    @Res() res: Response) {
    // 무한 스크롤 고려
    const take: number = 5;
    if(!page) page = 1;
    let [sortResult, count] = await this.goalService.getAllGoals(take, page);
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
        period: sortResult[i].period,
        status: sortResult[i].status,
        title: sortResult[i].title,
        hashTag: hashTag,
        emoji: sortResult[i].emoji,
        description: sortResult[i].description,
        createdAt: sortResult[i].createdAt,
        updatedAt: sortResult[i].updatedAt,
      });
    }
    let countPage: number = Math.ceil(count/take);
    let isLastPage: boolean;
    if(page == countPage) isLastPage = true;
    else isLastPage = false;
    res.json({ result, isLastPage });
  }

  // 임박 목표 불러오기
  @Get('imminent')
  @UseGuards(AuthGuard('jwt'))
  async getImminentGoal(
    @Req() req,
    @Res() res: Response){
      const take: number = 10;
      const status = "recruit";
      let sortResult = await this.goalService.getImminentGoal(take, status);
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
          period: sortResult[i].period,
          status: sortResult[i].status,
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
    const myUserId = req.user;
    const findGoal = await this.goalService.getGoalDetail(goalId);
    const joinUser = await this.usergoalService.getJoinUser(goalId);
    const member = [];
    for(let i = 0; i < joinUser.length; i++){
      const { userId: memberUserId, 
              nickname: memberNickname,
              image: memberImage } = joinUser[i].userId
      const { balanceId, current } = joinUser[i].balanceId
      const { accountId } = joinUser[i].accountId
      let attainment: number = 0;
      if(current !== 0){
        attainment = current/findGoal.amount * 100;
      }
      if(myUserId === memberUserId){
        member.push({
          userId: memberUserId,
          nickname: memberNickname,
          image: memberImage,
          attainment,
          accountId,
          balanceId,
        })
      }else {
        member.push({
          userId: memberUserId,
          nickname: memberNickname,
          image: memberImage,
          attainment,
        })
      }
    }

    const { userId, nickname } = findGoal.userId;
    const hashTag = findGoal.hashTag.split(",");
    const result = [];
    result.push({
      goalId: findGoal.goalId,
      isPrivate: findGoal.isPrivate,
      userId: userId,
      nickname: nickname,
      amount: findGoal.amount,
      curCount: findGoal.curCount,
      headCount: findGoal.headCount,
      startDate: findGoal.startDate,
      endDate: findGoal.endDate,
      period: findGoal.period,
      status: findGoal.status,
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
      findGoal.curCount -= 1;
      await this.goalService.updateGoalCurCount(goalId, findGoal.curCount);
      res.json({ message: "목표 탈퇴 완료" });
    }
  }

  // 목표 삭제
  @Delete(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async deleteGoal(
    @Req() req,
    @Param('goalId') goalId: number,
    @Res() res: Response,
  ) {
    const userId: number = req.user; 
    const find = await this.goalService.getGoalDetail(goalId);
    if (userId != find.userId.userId){
      throw new HttpException('삭제 권한이 없습니다.', 400);
    }
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
