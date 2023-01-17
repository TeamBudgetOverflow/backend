import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeORMConfig } from './configs/typeorm.config';
import { GoalModule } from './goal/goal.module';
import { AccountsModule } from './accounts/accounts.module';
import { BanksModule } from './banks/banks.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    GoalModule,
    TypeOrmModule.forRoot(typeORMConfig),
    AccountsModule,
    BanksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
