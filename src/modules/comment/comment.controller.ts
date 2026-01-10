import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
    constructor (private readonly commentService: CommentService){}

    @UseGuards(AuthGuard('jwt'))
    @Post('/post/:postId/comment')
    create(
        @Param('postId') postId: number,
        @Body() dto: CreateCommentDto,
        @Req() req,
    ) {
        return this.commentService.create(postId, req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':commentId')
    update(
        @Param('commentId') commentId: number,
        @Body() dto: UpdateCommentDto,
        @Req() req,
    ) {
        return this.commentService.update(commentId, req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':commentId')
    remove(
        @Param('commentId') commentId: number,
        @Req() req,
    ) {
        return this.commentService.remove(commentId, req.user.userId);
    }
}
