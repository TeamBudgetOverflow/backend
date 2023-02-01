import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoAuthGuard } from './kakao/kakao-auth.guard';

@Controller('model')
export class AuthController {
  constructor(private readonly appService: AuthService) {}
}
