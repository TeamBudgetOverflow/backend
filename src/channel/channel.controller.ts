import { Controller, Get, Post, Delete, Query, Param, Body } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller(':url/channels')
export class ChannelController {
    constructor(private channelService: ChannelService){}

    // 내가 참여한 채널 불러오기
    @Get()
    getMyChannel(@Param('url') url: string) {

    }

    // 목표 시작시 채널 생성
    @Post()
    createChannel() {

    }

    // 목표가 완료됬을 때 채널 삭제
    @Delete()
    deleteCahnnel() {

    }

    // 내가 가입한 채널의 채팅 불러오기
    @Get(':name/chats')
    getChats(@Query() query, @Param() param) {

    }

    // 내가 가입한 채널 채팅 업로드
    @Post(':name/chats')
    postChat(@Body() body) {

    }

    // 내가 가입한 채널 이미지 채팅 올리기
    @Post(':name/images')
    postImage(@Body() body) {
        
    }
    
    @Get(':name/members')
    getAllMembers() {

    }
}
