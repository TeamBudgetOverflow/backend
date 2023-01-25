import { MiddlewareConsumer, Module, NestModule, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeORMConfig } from './configs/typeorm.config';
import { GoalModule } from './goal/goal.module';
import { AccountsModule } from './accounts/accounts.module';
import { BanksModule } from './banks/banks.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    GoalModule,
    TypeOrmModule.forRoot(typeORMConfig),
    AccountsModule,
    BanksModule,
    ChannelModule,
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
