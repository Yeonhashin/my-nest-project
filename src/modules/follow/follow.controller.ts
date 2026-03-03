import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { FollowService } from './follow.service';

@ApiTags('Follow')
@ApiBearerAuth() // 🔑 이 컨트롤러의 모든 API는 JWT 필요
@UseGuards(AuthGuard('jwt'))
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':userId')
  @ApiOperation({ summary: '사용자 팔로우' })
  @ApiParam({
    name: 'userId',
    description: '팔로우할 대상 사용자 ID',
    example: 2,
  })
  follow(
    @Req() req,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ) {
    return this.followService.follow(req.user.userId, targetUserId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: '사용자 언팔로우' })
  @ApiParam({
    name: 'userId',
    description: '언팔로우할 대상 사용자 ID',
    example: 2,
  })
  unfollow(
    @Req() req,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ) {
    return this.followService.unfollow(req.user.userId, targetUserId);
  }

  @Get('followers')
  @ApiOperation({ summary: '내 팔로워 목록 조회' })
  getFollowers(@Req() req) {
    return this.followService.getFollowers(req.user.userId);
  }

  @Get('followings')
  @ApiOperation({ summary: '내 팔로잉 목록 조회' })
  getFollowings(@Req() req) {
    return this.followService.getFollowings(req.user.userId);
  }
}
