import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/models/users';
import { Channels } from 'src/models/channels';
import { ChannelChats } from 'src/models/ChannelChats';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Channels, ChannelChats]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService]
})
export class ChannelModule {}
