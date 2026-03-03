import {
  Controller,
  Body,
  Post as HttpPost,
  Get,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostQueryDto } from './dto/get-post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // =====================
  // 게시글 생성 (JWT 필요)
  // =====================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpPost()
  @ApiOperation({ summary: '게시글 생성' })
  create(@Req() req, @Body() dto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postService.create(userId, dto);
  }

  // =====================
  // 게시글 목록 조회 (공개)
  // =====================
  @Get()
  @ApiOperation({ summary: '게시글 목록 조회' })
  findAll(@Query() query: GetPostQueryDto) {
    return this.postService.findAll(query);
  }

  // =====================
  // 게시글 단건 조회 (공개)
  // =====================
  @Get(':id')
  @ApiOperation({ summary: '게시글 단건 조회' })
  @ApiParam({
    name: 'id',
    description: '조회할 게시글 ID',
    example: 1,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  // =====================
  // 게시글 수정 (JWT 필요)
  // =====================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiParam({
    name: 'id',
    description: '수정할 게시글 ID',
    example: 1,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.postService.update(id, dto, userId);
  }

  // =====================
  // 게시글 삭제 (JWT 필요)
  // =====================
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiParam({
    name: 'id',
    description: '삭제할 게시글 ID',
    example: 1,
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.postService.remove(id, userId);
  }
}
