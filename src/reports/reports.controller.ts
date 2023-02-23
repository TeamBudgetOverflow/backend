import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoalService } from 'src/goal/goal.service';
import { InputReportGoalDTO } from './dto/inputReportGoal.dto';
import { ReportGoalDTO } from './dto/reportGoal.dto';
import { ReportsService } from './reports.service';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { BalanceService } from 'src/balances/balances.service';
import { SlackService } from 'src/slack/slack.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/common/decorators/user.decorator';

@Controller('api/report')
export class ReportsController {
  constructor(
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountsService: AccountsService,
    @Inject(forwardRef(() => BalanceService))
    private readonly balanceService: BalanceService,
    private readonly reportService: ReportsService,
    private readonly slackService: SlackService,
  ) {}

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
      this.reportCountValidation(goalId);
      return { message: '신고가 완료되었습니다.' };
    }
  }

  // 목표 수가 일정치 이상 누적되면 슬렉으로 알림 호출
  async reportCountValidation(goalId: number) {
    const [reportList, count] = await this.reportService.getReportsByGoalId(
      goalId,
    );
    if (count != 0) {
      let data = [];
      for (let i = 0; i < count; i++) {
        data.push({
          userEmail: reportList[i].User.email,
          reason: reportList[i].reason,
        });
      }
      await this.slackService.sendSlackNotification(goalId, count, data);
    }
  }

  @Put(':goalId')
  @UseGuards(AuthGuard('jwt'))
  async reportDeleteGoal(@User() user, @Param('goalId') goalId) {
    const userId = user;
    const userData = await this.userService.findUserByUserId(userId);
    // 관리자 계정 검증 로직에 대한 합의가 이루어지지 않음
    if (userData.loginCategory !== 'Dev') {
      throw new HttpException(
        '권한이 없는 호출입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userGoal = await this.userGoalService.getJoinUser(goalId);
    for (let i = 0; i < userGoal.length; i++) {
      let userGoalId = userGoal[i].userGoalsId;
      let status: string = 'denied';
      // userGoal status 변경 - denied
      await this.userGoalService.updateStauts(userGoalId, status);
    }
    // 목표 상태 변경 - denied
    await this.goalService.denyGoal(goalId);
    return { message: '신고된 목표가 처리되었습니다.' };
  }
}
