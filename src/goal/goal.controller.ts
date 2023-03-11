import { GoalService } from './goal.service';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  Post,
  Param,
  Query,
  Body,
  Put,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InputUpdateGoalDTO } from '../goal/dto/inputUpdateGoal.dto';
import { InputCreateGoalDTO } from '../goal/dto/inputCreateGoal.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('api/goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  // 목표 생성
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createGoal(
    @User() user,
    @Body(new ValidationPipe()) createGoalDTO: InputCreateGoalDTO,
  ) {
    const userId: number = user;
    if (createGoalDTO.title.length < 4 || createGoalDTO.title.length > 25) {
      throw new HttpException('잘못된 형식입니다.', HttpStatus.BAD_REQUEST);
    }

    if (createGoalDTO.amount < 1000 || createGoalDTO.amount > 70000) {
      throw new HttpException('잘못된 형식입니다.', HttpStatus.BAD_REQUEST);
    }

    if (createGoalDTO.description.length > 255) {
      throw new HttpException('잘못된 형식입니다.', HttpStatus.BAD_REQUEST);
    }

    if (new Date(createGoalDTO.startDate) > new Date(createGoalDTO.endDate)) {
      throw new HttpException('Date 설정 오류', HttpStatus.BAD_REQUEST);
    }

    await this.goalService.verifyLinkedAccount(createGoalDTO.accountId, userId);

    const result = await this.goalService.createGoal(createGoalDTO, userId);

    return { goalId: result.goalId, message: '목표 생성 완료' };
  }

  //목표 참가
  @Post('join/:goalId')
  @UseGuards(AuthGuard('jwt'))
  async joinGoal(
    @User() user,
    @Body('accountId') accountId: number,
    @Param('goalId') goalId: number,
  ) {
    const userId = user;
    // 검증 -> 목표 참가
    await this.goalService.joinValidation(goalId, userId, accountId);

    return { message: '참가가 완료되었습니다.' };
  }

  // 목표 검색
  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  async searchGoal(@Query() paginationQuery) {
    const { result, returnCursor, goalId, isLastPage, count } =
      await this.goalService.searchGoalLogic(paginationQuery);

    return { result, cursor: returnCursor, goalId, isLastPage, count };
  }

  // 목표 전체 조회
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllGoal(@Query('cursor') cursor: number) {
    const { result, returnCursor, isLastPage } =
      await this.goalService.getAllGoalDataProcess(cursor);
    return { result, cursor: returnCursor, isLastPage };
  }

  // 임박 목표 불러오기
  @Get('imminent')
  @UseGuards(AuthGuard('jwt'))
  async getImminentGoal() {
    return await this.goalService.ImminentGoalDataProcess();
  }

  // 목표 상세 조회
  @Get(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async getGoalDetail(@User() user, @Param('goalId') goalId: number) {
    const myUserId = user;
    const result = await this.goalService.goalDetailLogic(goalId, myUserId);
    return { result };
  }

  // 목표 수정
  @Put(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async updateGoal(
    @User() user,
    @Param('goalId') goalId: number,
    @Body() inputUpdateGoalDTO: InputUpdateGoalDTO,
  ) {
    const userId: number = user;
    await this.goalService.updateGoalLogic(userId, inputUpdateGoalDTO, goalId);
    return { message: '목표 수정 완료' };
  }

  // 목표 탈퇴
  // 목표 시작 전에만 가능함
  @Delete('exit/:goalId')
  @UseGuards(AuthGuard('jwt'))
  async exitGoal(@User() user, @Param('goalId') goalId: number) {
    const userId: number = user;
    await this.goalService.exitGoalLogic(goalId, userId);
    return { message: '목표 탈퇴 완료' };
  }

  // 목표 삭제
  @Delete(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async deleteGoal(@User() user, @Param('goalId') goalId: number) {
    const userId: number = user;
    await this.goalService.deleteGoalLogic(goalId, userId);
    return { message: '목표 삭제 완료' };
  }
}
