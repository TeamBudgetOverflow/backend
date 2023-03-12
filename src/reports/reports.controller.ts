import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InputReportGoalDTO } from './dto/inputReportGoal.dto';
import { ReportsService } from './reports.service';
import { User } from 'src/common/decorators/user.decorator';

@Controller('api/report')
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  @Post(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async reportGoal(
    @User() user,
    @Body() input: InputReportGoalDTO,
    @Param('goalId') goalId: number,
  ) {
    const userId: number = user;
    // 검증: reason 글자 수
    if (input.reason.length < 4 || input.reason.length > 50) {
      throw new HttpException(
        '신고사유 형식 오류입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 검증: Param GoalId와 input GoalId 비교
    if (goalId != input.goalId) {
      throw new HttpException('잘못된 목표입니다.', HttpStatus.BAD_REQUEST);
    }
    await this.reportService.reportLogic(goalId, userId, input);
    return { message: '신고가 완료되었습니다.' };
  }

  @Put(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async reportDeleteGoal(@User() user, @Param('goalId') goalId) {
    const userId = user;
    await this.reportService.reportDeleteGoalLogic(userId, goalId);
    return { message: '신고된 목표가 처리되었습니다.' };
  }
}
