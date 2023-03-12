import {
  forwardRef,
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reports } from 'src/entity/reports';
import { GoalService } from 'src/goal/goal.service';
import { SlackService } from 'src/slack/slack.service';
import { UserService } from 'src/user/user.service';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { DataSource, Repository } from 'typeorm';
import { InputReportGoalDTO } from './dto/inputReportGoal.dto';
import { ReportGoalDTO } from './dto/reportGoal.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports)
    private reportRepository: Repository<Reports>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    private readonly slackService: SlackService,
    private dataSource: DataSource,
  ) {}
  async getReport(data): Promise<Reports> {
    return await this.reportRepository
      .createQueryBuilder('r')
      .where('r.User = :User', { User: data.User })
      .andWhere('r.Goal = :Goal', { Goal: data.Goal })
      .getOne();
  }

  async getReportsByGoalId(goalId: number) {
    return await this.reportRepository
      .createQueryBuilder('r')
      .where('r.Goal = :Goal', { Goal: goalId })
      .leftJoin('r.User', 'User')
      .leftJoin('r.Goal', 'Goal')
      .select(['r.reportId', 'r.reason', 'User.email', 'Goal.goalId'])
      .getManyAndCount();
  }

  // 신고 로직
  async reportLogic(goalId: number, userId: number, input: InputReportGoalDTO) {
    // 목표 신고 검증
    await this.reportValidation(goalId, userId);
    // 목표 신고
    const data2: ReportGoalDTO = {
      Goal: goalId,
      User: userId,
      reason: input.reason,
    };
    const result = await this.createReport(data2);
    // 검증: 예상치 못한 이유로 신고가 되지 않은 경우
    if (!result) {
      throw new HttpException('신고가 실패했습니다.', HttpStatus.NOT_FOUND);
    } else {
      this.reportCountValidation(goalId);
    }
  }

  // 목표 신고 검증 메소드
  async reportValidation(goalId: number, userId: number) {
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
    const existReport = await this.getReport(data1);
    if (existReport) {
      throw new HttpException(
        '이미 신고된 목표입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createReport(data): Promise<Reports> {
    return await this.reportRepository.save(data);
  }

  // 목표 수가 일정치 이상 누적되면 슬렉으로 알림 호출
  async reportCountValidation(goalId: number) {
    const [reportList, count] = await this.getReportsByGoalId(goalId);
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

  // 신고된 목표가 처리 됬을 때
  async reportDeleteGoalLogic(userId: number, goalId: number) {
    // 관리자 계정 검증
    await this.adminValidation(userId);
    // 목표에 참가되어있는 유저들의 UserGoals 상태 변경
    await this.userGoalsStatusUpdate(goalId);
    // 목표 상태 변경 - denied
    await this.goalService.denyGoal(goalId);
  }

  async adminValidation(userId: number) {
    const userData = await this.userService.findUserByUserId(userId);
    // 관리자 계정 검증 로직에 대한 합의가 이루어지지 않음
    if (userData.loginCategory !== 'Dev') {
      throw new HttpException(
        '권한이 없는 호출입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async userGoalsStatusUpdate(goalId: number) {
    const userGoal = await this.userGoalService.getJoinUser(goalId);
    for (let i = 0; i < userGoal.length; i++) {
      let userGoalId = userGoal[i].userGoalsId;
      let status: string = 'denied';
      // userGoal status 변경 - denied
      await this.userGoalService.updateStauts(userGoalId, status);
    }
  }
}
