import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LikeService } from './like.service';

@Controller('post/:postId/like')
@UseGuards(AuthGuard('jwt'))
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
  ) {
    return this.likeService.likePost(req.user.userId, postId);
  }

  @Delete()
  unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
  ) {
    return this.likeService.unlikePost(req.user.userId, postId);
  }
}
