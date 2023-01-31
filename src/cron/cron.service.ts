import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GoalService } from 'src/goal/goal.service';
import { Goals } from 'src/models/goals';
import { UserGoalService } from 'src/usergoal/userGoal.service';
import { SchedulerRegistry } from './schedule.registry';

@Injectable()
export class CronService {
    constructor(
        private readonly goalService: GoalService,
        private readonly userGoalService: UserGoalService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ){}
    private readonly logger = new Logger(CronService.name)

    // 매일 자정 검사
    @Cron('0 40 16 * * *')
    async startGoal() {
        let status: string = "recruit";
        let {aDate,bDate} = this.getKstTime(new Date());
        console.log(aDate,bDate);
        const getStartGoal: Goals[] = await this.goalService.getStartGoalByStatus(
            status, aDate, bDate);
        console.log(getStartGoal);
        status = "proceeding"
        for(let i=0; i<getStartGoal.length; i++) {
            // 가져온 Goal으로 로직 수행
            // 1. recruit -> proceeding
            await this.goalService.goalUpdateStatus(getStartGoal[i].goalId, status);
            // 2. UserGoal 상태 변화
            // 3. 멤버 가져와서 채팅방 개설
        }

    }

    @Cron('0 0 0 * * *')
    async endGoal() {
        let status: string = "proceeding";
        let {aDate,bDate} = this.getKstTime(new Date());
        console.log(aDate,bDate);
        const getEndGoal = await this.goalService.getEndGoalByStatus(
            status, aDate, bDate);
        console.log(getEndGoal);
        status = "done"
        for(let i=0; i<getEndGoal.length; i++) {
            // 가져온 Goal으로 로직 수행
            // 1. proceeding -> done
            await this.goalService.goalUpdateStatus(getEndGoal[i].goalId, status);
            // 2. UserGoal 상태 변화
            // 3. 채팅방 폐쇄 -> 3일 후 채팅방 폐쇄 스케쥴링
        }

    }

    // 이전 로직 남은 자료
    // 채팅방 폐쇄시 활용
    async addCronJob(name: string, start: Date, end: Date,
        goalId: number, type: string) {
        let transDate: string = '';
        let job: CronJob;
        if(type === "start") {
            transDate = this.transCronTime(start);
            job = new CronJob(`${transDate}`, async () => {
                //await this.startGoal(name, goalId, end);
                this.logger.warn(`Date (${start}) for job ${name} to run!`);
            });
        }else if(type === "end") {
            transDate = this.transCronTime(end);
            job = new CronJob(`${transDate}`, async () => {
                //await this.endGoal(goalId);
                this.logger.warn(`Date (${end}) for job ${name} to run!`);
            });
        }else {
            throw new HttpException(
                'type undefined',
                HttpStatus.BAD_REQUEST,
            );
        }
        console.log(transDate, type);
        console.log("job: ", job);
      
        await this.schedulerRegistry.addCronJob(name, job);
        job.start();
      
        console.log("job.lastDate(): ", job.lastDate());
        this.logger.warn(
          `job ${name} added for each minute at ${start} Date!`,
        );
        return job;
    }

    getCrons() {
        const jobs: Map<string, CronJob> = this.schedulerRegistry.getCronJobs();
        console.log("Hey jobs!", jobs);
        if(!jobs) console.log("jobs do not exist!")
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

    transCronTime(input: Date){
        const month = input.getMonth()+1;
        const day = input.getDate();
        const hour = input.getHours();
        const minutes = input.getMinutes();
        const seconds = input.getSeconds();
        const result: string = `${seconds} ${minutes} ${hour} ${day} ${month} *`
        return result;
    }

    getKstTime(input: Date) {
        const utc = input.getTime();
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const kstTime: Date = new Date(utc + (KR_TIME_DIFF));
        console.log(kstTime);
        const aYear = kstTime.getFullYear();
        const aMonth = kstTime.getMonth()+1;
        const aDay = kstTime.getDate();
        const tomorrow = new Date(input.getTime() + 35 * 60 * 60 * 1000);
        const bYear = tomorrow.getFullYear();
        const bMonth = tomorrow.getMonth()+1;
        const bDay = tomorrow.getDate();
        const aDate = `${aYear}, ${aMonth}, ${aDay}`;
        const bDate = `${bYear}, ${bMonth}, ${bDay}`;
        console.log(new Date(aDate));
        console.log(new Date(bDate));
        return {aDate, bDate};
    }
}