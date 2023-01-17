import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Banks } from 'src/models/banks';
import { Users } from 'src/models/users';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Banks]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BanksController],
  providers: [BanksService],
  // exports: [BanksService],
})
export class BanksModule {}
