// src/modules/user/user.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =====================
  // 회원가입 (공개)
  // =====================
  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  async register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  // =====================
  // 내 정보 조회 (JWT 필요)
  // =====================
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  async getMe(@Req() req) {
    return this.userService.findMe(req.user.userId);
  }

  // =====================
  // 내 정보 수정 (JWT 필요)
  // =====================
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  updateMe(
    @Req() req,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateMe(req.user.userId, dto);
  }
}
