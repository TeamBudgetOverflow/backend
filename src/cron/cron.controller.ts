import { Body, Controller, Get, Res, Response, Inject, forwardRef, Query } from "@nestjs/common";
import { CronService } from "./cron.service";
import { CronJob } from 'cron';
import { BadgeService } from "src/badges/badge.service";


@Controller('api/cron')
export class CronController {
  constructor(
    private readonly cronService: CronService,
    @Inject(forwardRef(() => BadgeService))
    private readonly badgeService: BadgeService,
  ) {}

  // @Get()
  // async getAllCron(
  //   @Body() data,
  //   @Res() res: Response,
  // ) {
  //   console.log(await this.badgeService.getBadge(data));
  //   res.json();
  // }

  // @Get("search")
  // async getOneCron(
  //   @Query('name') name: string,
  //   @Res() res: Response,
  // ) {
  //   const result = await this.cronService.getOneCron(name);
  //   console.log(result);
  //   res.json();
  // }
}