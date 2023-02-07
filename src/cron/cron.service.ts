import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GoalService } from 'src/goal/goal.service';
import { BadgeService } from 'src/badges/badge.service';
import { Goals } from 'src/models/goals';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { SchedulerRegistry } from './schedule.registry';
import { GetBadgeDTO } from 'src/badges/dto/getBadge.dto';

@Injectable()
export class CronService {
  constructor(
    @Inject(forwardRef(() => GoalService))
    private readonly goalService: GoalService,
    @Inject(forwardRef(() => UserGoalService))
    private readonly userGoalService: UserGoalService,
    @Inject(forwardRef(() => BadgeService))
    private readonly badgeService: BadgeService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  private readonly logger = new Logger(CronService.name);

  // 매일 자정 검사
  @Cron('0 0 0 * * *')
  async startGoal() {
    let status = 'recruit';
    const { aDate, bDate } = this.getKstTime(new Date());
    const getStartGoal: Goals[] = await this.goalService.getStartGoalByStatus(
      status,
      aDate,
      bDate,
    );
    // 스케쥴링 적용이 필요한 목표 호출
    for (let i = 0; i < getStartGoal.length; i++) {
      // 가져온 Goal으로 로직 수행
      // 1. recruit -> proceeding
      status = 'proceeding';
      await this.goalService.goalUpdateStatus(getStartGoal[i].goalId, status);
      // 2. UserGoal 상태 변화
      const getUserGoal = await this.userGoalService.getGoalByGoalId(
        getStartGoal[i].goalId,
      );
      status = 'in progress';
      for (let j = 0; j < getUserGoal.length; j++) {
        await this.userGoalService.updateStauts(
          getUserGoal[j].userGoalsId,
          status,
        );
        const userId: number = getUserGoal[j].userId.userId;
        const [getFirstJoin, count] =
          await this.userGoalService.getCountUserPastJoin(userId);
        if (count === 0 && getStartGoal[i].headCount > 1) {
          const badgeId = 3;
          const data: GetBadgeDTO = { User: userId, Badges: badgeId };
          await this.badgeService.getBadge(data);
        }
      }
      // 3. 멤버 가져와서 채팅방 개설
    }
  }

  @Cron('0 0 0 * * *')
  async endGoal() {
    let status = 'proceeding';
    const { aDate, bDate } = this.getKstTime(new Date());
    const getEndGoal = await this.goalService.getEndGoalByStatus(
      status,
      aDate,
      bDate,
    );
    status = 'done';
    // 종료 목표 로직 수행
    for (let i = 0; i < getEndGoal.length; i++) {
      // 가져온 Goal으로 로직 수행
      // 1. proceeding -> done
      await this.goalService.goalUpdateStatus(getEndGoal[i].goalId, status);
      const getUserGoal = await this.userGoalService.getGoalByGoalId(
        getEndGoal[i].goalId,
      );
      const headCount = getEndGoal[i].headCount;
      // 2. UserGoal 상태 변화
      for (let j = 0; j < getUserGoal.length; j++) {
        await this.userGoalService.updateStauts(
          getUserGoal[j].userGoalsId,
          status,
        );
        const userId = getUserGoal[j].userId.userId;
        let badgeId: number;
        // 목표 액수 달성 시 이전 달성 횟수 파악 후 뱃지 획득
        if (
          getUserGoal[j].goalId.amount ===
          getUserGoal[j].balanceId.current - getUserGoal[j].balanceId.initial
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
                await this.badgeService.getBadge(data);
                break;
              case 3: // 세번쨰 그룹 목표 달성 badge no. 6
                badgeId = 6;
                data = { User: userId, Badges: badgeId };
                await this.badgeService.getBadge(data);
                break;
              default:
                break;
            }
          } else if (headCount === 1 && goalCountAchievPersonal === 1) {
            // ex. Grant users the badge no. 2
            // 개인 목표 첫 달성
            badgeId = 2;
            data = { User: userId, Badges: badgeId };
            await this.badgeService.getBadge(data);
          }
        }
      }
      // 3. 채팅방 폐쇄 -> 3일 후 채팅방 폐쇄 스케쥴링
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
