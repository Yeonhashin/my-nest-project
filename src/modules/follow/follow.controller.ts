import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FollowService } from './follow.service';

@Controller('follow')
@UseGuards(AuthGuard('jwt'))
export class FollowController {
    constructor (private readonly followService: FollowService){}

    @Post(':userId')
    follow(
        @Req() req,
        @Param('userId', ParseIntPipe) targetUserId: number,
    ) {
        return this.followService.follow(req.user.userId, targetUserId);
    }

    @Delete(':userId')
    unfollow(
        @Req() req,
        @Param('userId', ParseIntPipe) targetUserId: number,
    ) {
        return this.followService.unfollow(req.user.userId, targetUserId);
    }

    @Get('followers')
    getFollowers(@Req() req) {
        return this.followService.getFollowers(req.user.userId);
    }

    @Get('followings')
    getFollowings(@Req() req) {
        return this.followService.getFollowings(req.user.userId);
    }
}
