import { MiddlewareConsumer, Module, NestModule, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getTypeOrmConfig } from './configs/typeorm.config';
import { GoalModule } from './goal/goal.module';
import { AccountsModule } from './accounts/accounts.module';
import { BanksModule } from './banks/banks.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CronModule } from './cron/cron.module';
import { ReportsModule } from './reports/report.module';
import { SlackModule } from './slack/slack.module';
import slackConfig from './configs/slack.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [slackConfig] }),
    TypeOrmModule.forRootAsync({ useFactory: getTypeOrmConfig }),
    UserModule,
    GoalModule,
    AccountsModule,
    BanksModule,
    CronModule,
    ReportsModule,
    SlackModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
  exports: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
