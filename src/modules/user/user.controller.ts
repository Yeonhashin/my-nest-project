// src/modules/user/user.controller.ts
import { Body, Controller, Post, Get, Req, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req) {
    console.log('USER CONTROLLER HIT');
    return this.userService.findMe(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateMe(
    @Req() req,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateMe(req.user.userId, dto);
  }
}
