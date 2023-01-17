import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Accounts } from 'src/models/accounts';
import { Users } from 'src/models/users';
import { UserService } from 'src/user/user.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Users, Accounts]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, UserService, AuthService, JwtService],
})
export class AccountsModule {}
