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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { LikeService } from './like.service';

@ApiTags('Like')
@ApiBearerAuth() // 🔑 JWT 필수
@UseGuards(AuthGuard('jwt'))
@Controller('post/:postId/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @ApiOperation({ summary: '게시글 좋아요' })
  @ApiParam({
    name: 'postId',
    description: '좋아요를 누를 게시글 ID',
    example: 1,
  })
  likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
  ) {
    return this.likeService.likePost(req.user.userId, postId);
  }

  @Delete()
  @ApiOperation({ summary: '게시글 좋아요 취소' })
  @ApiParam({
    name: 'postId',
    description: '좋아요를 취소할 게시글 ID',
    example: 1,
  })
  unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
  ) {
    return this.likeService.unlikePost(req.user.userId, postId);
  }
}
