import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentService } from './comment.service';

@ApiTags('Comment')
@ApiBearerAuth() // 🔑 이 컨트롤러의 모든 API는 JWT 필요
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/post/:postId/comment')
  @ApiOperation({ summary: '댓글 생성' })
  @ApiParam({
    name: 'postId',
    description: '댓글을 작성할 게시글 ID',
    example: 1,
  })
  create(
    @Param('postId') postId: number,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    return this.commentService.create(postId, req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':commentId')
  @ApiOperation({ summary: '댓글 수정' })
  @ApiParam({
    name: 'commentId',
    description: '수정할 댓글 ID',
    example: 10,
  })
  update(
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentDto,
    @Req() req,
  ) {
    return this.commentService.update(commentId, req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiParam({
    name: 'commentId',
    description: '삭제할 댓글 ID',
    example: 10,
  })
  remove(
    @Param('commentId') commentId: number,
    @Req() req,
  ) {
    return this.commentService.remove(commentId, req.user.userId);
  }
}
