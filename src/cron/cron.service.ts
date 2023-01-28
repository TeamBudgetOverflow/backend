import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { GoalService } from 'src/goal/goal.service';
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
    // tpye = start / end 에 따라 Method 호출 분기 결정
    async addCronJob(name: string, start: Date, end: Date,
        goalId: number, type: string) {
        let transDate: string = '';
        if(type === "start") transDate = this.transCronTime(start);
        else if(type === "end") transDate = this.transCronTime(end);
        else {
            throw new HttpException(
                'type undefined',
                HttpStatus.BAD_REQUEST,
            );
        }
        console.log(transDate, type);
        const job = new CronJob(`${transDate}`, async () => {
            if(type === "start"){
                console.log("Hey Start!");
                await this.startGoal(name, goalId, end);
            }else if(type === "end"){
                console.log("Hey END!");
                await this.endGoal(goalId);
            }else {
                throw new HttpException(
                    'type undefined',
                    HttpStatus.BAD_REQUEST,
                );
            }
            this.logger.warn(`Date (${start}) for job ${name} to run!`);
        });
        console.log(job);
      
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
      
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

    async startGoal(name: string, goalId: number, end: Date) {
        // 1. Goal 상태 변겅
        const status: string = "proceeding"
        await this.goalService.goalUpdateStatus(goalId, status);
        // 2. UserGoal 상태 변경
        // 3. 그룹 채팅방 개설
        // 4. 목표 완료 Cron API 호출
        const updateName: string = name + "_end";
        const type: string = "end";
        const start: Date = null;
        await this.addCronJob(updateName, start, end, goalId, type);
    }
    
    async endGoal(goalId: number) {
        // 1. Goal 상태 변겅
        const status: string = "done"
        await this.goalService.goalUpdateStatus(goalId, status);
        // 2. UserGoal 상태 변경
        // 3. 그룹 채팅방 폐쇄 -> 3일 후 폐쇠 API 호출, 해당 채팅방 공지 알림
    }

    transCronTime(input: Date){
        const month = input.getMonth() + 1;
        const day = input.getUTCDate();
        const hour = input.getHours();
        const minutes = input.getMinutes();
        const seconds = input.getSeconds();
        const result: string = `${seconds} ${minutes} ${hour} ${day} ${month} 0`
        return result;
    }
}