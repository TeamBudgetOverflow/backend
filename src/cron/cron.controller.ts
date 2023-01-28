import { Body, Controller, Get, Res, Response, Param, Query } from "@nestjs/common";
import { CronService } from "./cron.service";
import { CronJob } from 'cron';


@Controller('api/cron')
export class CronController {
  constructor(
    private readonly cronService: CronService,
  ) {}

  @Get()
  async getAllCron(
    @Res() res: Response,
  ) {
    await this.cronService.getCrons();
    res.json();
  }

  @Get("search")
  async getOneCron(
    @Query('name') name: string,
    @Res() res: Response,
  ) {
    const result = await this.cronService.getOneCron(name);
    console.log(result);
    res.json();
  }

  @Get("test")
  testMethod(
    @Body("input") input,
    @Res() res: Response,
  ) {
    const inputs = new Date(input);
    console.log(inputs.getDate());
    this.cronService.transCronTime(inputs);
    res.json();
  }
}