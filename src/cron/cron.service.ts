import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GoalService } from 'src/goal/goal.service';
import { BadgeService } from 'src/badges/badge.service';
import { Goals } from 'src/entity/goals';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { SchedulerRegistry } from './schedule.registry';
import { GetBadgeDTO } from 'src/badges/dto/getBadge.dto';
import { ReportsService } from 'src/reports/reports.service';
import { DataSource, QueryRunner } from 'typeorm';
import { UserGoals } from 'src/entity/usergoals';

@Injectable()
export class CronService {
  constructor(
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    @Inject(forwardRef(() => BadgeService))
    private readonly badgeService: BadgeService,
    @Inject(forwardRef(() => ReportsService))
    private readonly reportsService: ReportsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private dataSource: DataSource,
  ) {}
  private readonly logger = new Logger(CronService.name);

  // 매일 자정 검사
  @Cron('0 0 0 * * *')
  async startGoal() {
    const { aDate, bDate } = this.getKstTime(new Date());
    const status = 'recruit';
    const getStartGoal: Goals[] = await this.goalService.getStartGoalByStatus(
      status,
      aDate,
      bDate,
    );
    // 트랜젝션 처리를 위한 별도 메소드 호출
    await this.processStartGoals(getStartGoal);
  }

  async processStartGoals(getStartGoal: Goals[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 스케쥴링 적용이 필요한 목표 호출
      for (let i = 0; i < getStartGoal.length; i++) {
        // 가져온 Goal으로 로직 수행
        await this.processGoal(getStartGoal, queryRunner, i);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async processGoal(
    getStartGoal: Goals[],
    queryRunner: QueryRunner,
    i: number,
  ) {
    // 1. recruit -> proceeding
    let status = 'proceeding';
    await this.goalService.goalUpdateStatus(
      getStartGoal[i].goalId,
      status,
      queryRunner,
    );
    // 2. UserGoal 상태 변화
    const getUserGoal = await this.userGoalService.getGoalByGoalId(
      getStartGoal[i].goalId,
    );
    status = 'in progress';
    for (let j = 0; j < getUserGoal.length; j++) {
      await this.userGoalService.updateStauts(
        getUserGoal[j].userGoalsId,
        status,
        queryRunner,
      );
      // 뱃지 획득 검증
      const userId: number = getUserGoal[j].userId.userId;
      const [getFirstJoin, count] =
        await this.userGoalService.getCountUserPastJoin(userId);
      if (count === 0 && getStartGoal[i].headCount > 1) {
        const badgeId = 3;
        const data: GetBadgeDTO = { User: userId, Badges: badgeId };
        await this.badgeService.getBadge(data, queryRunner);
      }
    }
  }

  @Cron('0 0 0 * * *')
  async endGoal() {
    const status = 'proceeding';
    const { aDate, bDate } = this.getKstTime(new Date());
    const getEndGoal = await this.goalService.getEndGoalByStatus(
      status,
      aDate,
      bDate,
    );
    await this.processEndGoals(getEndGoal);
  }

  async processEndGoals(endGoals: Goals[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 스케쥴링 적용이 필요한 목표 호출
      for (let i = 0; i < endGoals.length; i++) {
        // 가져온 Goal으로 로직 수행
        await this.processEndGoal(endGoals[i], queryRunner);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 목표 상태 변경
  async processEndGoal(endGoal: Goals, queryRunner: QueryRunner) {
    const headCount = endGoal.headCount;
    const status = 'done';
    // 1. proceeding -> done
    await this.goalService.goalUpdateStatus(
      endGoal.goalId,
      status,
      queryRunner,
    );
    const getUserGoal = await this.userGoalService.getGoalByGoalId(
      endGoal.goalId,
    );
    // UserGoal 상태 변경
    for (let i = 0; i < getUserGoal.length; i++) {
      await this.processEndUserGoal(
        headCount,
        getUserGoal[i],
        queryRunner,
        status,
      );
    }
  }

  // UserGoal 상태 변경
  async processEndUserGoal(
    headCount: number,
    getUserGoal: UserGoals,
    queryRunner: QueryRunner,
    status: string,
  ) {
    await this.userGoalService.updateStauts(
      getUserGoal.userGoalsId,
      status,
      queryRunner,
    );
    await this.processEndGoalGetBadges(getUserGoal, headCount, queryRunner);
  }

  async processEndGoalGetBadges(
    getUserGoal: UserGoals,
    headCount: number,
    queryRunner: QueryRunner,
  ) {
    const userId = getUserGoal.userId.userId;
    let badgeId: number;
    // 목표 액수 달성 시 이전 달성 횟수 파악 후 뱃지 획득
    if (
      getUserGoal.goalId.amount ===
      getUserGoal.balanceId.current - getUserGoal.balanceId.initial
    ) {
      const goalCountAchievPersonal =
        await this.userGoalService.getCountAchievPersonal(userId);
      const getCountAchievGroup =
        await this.userGoalService.getCountAchievGroup(userId);
      let data: GetBadgeDTO;
      if (headCount > 1) {
        switch (getCountAchievGroup) {
          case 1: // 그룹 목표 첫 달성 badge no. 5
            badgeId = 5;
            data = { User: userId, Badges: badgeId };
            await this.badgeService.getBadge(data, queryRunner);
            break;
          case 3: // 세번쨰 그룹 목표 달성 badge no. 6
            badgeId = 6;
            data = { User: userId, Badges: badgeId };
            await this.badgeService.getBadge(data, queryRunner);
            break;
          default:
            break;
        }
      } else if (headCount === 1 && goalCountAchievPersonal === 1) {
        // ex. Grant users the badge no. 2
        // 개인 목표 첫 달성
        badgeId = 2;
        data = { User: userId, Badges: badgeId };
        await this.badgeService.getBadge(data, queryRunner);
      }
    }
  }

  // 이전 로직 남은 자료
  // 채팅방 폐쇄시 활용
  async addCronJob(
    name: string,
    start: Date,
    end: Date,
    goalId: number,
    type: string,
  ) {
    let transDate = '';
    let job: CronJob;
    if (type === 'start') {
      transDate = this.transCronTime(start);
      job = new CronJob(`${transDate}`, async () => {
        //await this.startGoal(name, goalId, end);
        this.logger.warn(`Date (${start}) for job ${name} to run!`);
      });
    } else if (type === 'end') {
      transDate = this.transCronTime(end);
      job = new CronJob(`${transDate}`, async () => {
        //await this.endGoal(goalId);
        this.logger.warn(`Date (${end}) for job ${name} to run!`);
      });
    } else {
      throw new HttpException('type undefined', HttpStatus.BAD_REQUEST);
    }
    console.log(transDate, type);
    console.log('job: ', job);

    await this.schedulerRegistry.addCronJob(name, job);
    job.start();

    console.log('job.lastDate(): ', job.lastDate());
    this.logger.warn(`job ${name} added for each minute at ${start} Date!`);
    return job;
  }

  getCrons() {
    const jobs: Map<string, CronJob> = this.schedulerRegistry.getCronJobs();
    console.log('Hey jobs!', jobs);
    if (!jobs) console.log('jobs do not exist!');
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      console.log(`job: ${key} -> next: ${next}`);
      this.logger.log(`job: ${key} -> next: ${next}`);
    });
    return jobs;
  }

  getOneCron(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    return job;
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }

  transCronTime(input: Date) {
    const month = input.getMonth() + 1;
    const day = input.getDate();
    const hour = input.getHours();
    const minutes = input.getMinutes();
    const seconds = input.getSeconds();
    const result = `${seconds} ${minutes} ${hour} ${day} ${month} *`;
    return result;
  }

  getKstTime(input: Date) {
    const utc = input.getTime();
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kstTime: Date = new Date(utc + KR_TIME_DIFF);
    const aYear = input.getFullYear();
    const aMonth = input.getMonth() + 1;
    const aDay = input.getDate();
    const tomorrow = new Date(input.getTime() + 24 * 60 * 60 * 1000);
    const bYear = tomorrow.getFullYear();
    const bMonth = tomorrow.getMonth() + 1;
    const bDay = tomorrow.getDate();
    const aDate = `${aYear}, ${aMonth}, ${aDay}`;
    const bDate = `${bYear}, ${bMonth}, ${bDay}`;
    return { aDate, bDate };
  }
}
