import {
  Controller,
  Post,
  Req,
  UseGuards,
  Body,
  Res,
  Param,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GoalService } from 'src/goal/goal.service';
import { InputReportGoalDTO } from './dto/inputReportGoal.dto';
import { ReportGoalDTO } from './dto/reportGoal.dto';
import { ReportsService } from './reports.service';

@Controller('api/report')
export class ReportsController {
  constructor(
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    private readonly reportService: ReportsService,
  ) {}

  @Post(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async reportGoal(
    @Req() req,
    @Body() input: InputReportGoalDTO,
    @Param('goalId') goalId: number,
    @Res() res: Response,
  ) {
    const userId: number = req.user;
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
    // 검증: 존재하지 않는 목표
    const findGoal = await this.goalService.getGoalDetail(goalId);
    if (!findGoal) {
      throw new HttpException('존재하지 않는 목표입니다', HttpStatus.NOT_FOUND);
    }
    // 검증: 자기 자신의 목표는 신고할 수 없음.
    if (userId === findGoal.userId.userId) {
      throw new HttpException(
        '신고할 수 없는 목표입니다(게시자 본인).',
        HttpStatus.NOT_FOUND,
      );
    }
    const data1 = { Goal: goalId, User: userId };
    // 검증: 이미 신고한 목표의 경우 중복 신고 불가
    const existReport = await this.reportService.getReport(data1);
    console.log(existReport);
    if (existReport) {
      throw new HttpException(
        '이미 신고된 목표입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 검증: 예상치 못한 이유로 신고가 되지 않은 경우
    const data2: ReportGoalDTO = {
      Goal: goalId,
      User: userId,
      reason: input.reason,
    };
    const result = await this.reportService.createReport(data2);
    if (!result) {
      throw new HttpException('신고가 실패했습니다.', HttpStatus.NOT_FOUND);
    } else {
      res.json({ message: '신고가 완료되었습니다.' });
    }
  }
}
