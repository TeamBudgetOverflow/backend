import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('model')
export class AuthController {
  constructor(private readonly appService: AuthService) {}
}
