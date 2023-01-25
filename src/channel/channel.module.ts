import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/models/users';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService]
})
export class ChannelModule {}
