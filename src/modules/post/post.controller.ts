import { Controller, Body, Post as HttpPost, Get, Req, UseGuards, Query, ParseIntPipe, Param, Patch, Delete } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostQueryDto } from './dto/get-post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';


@Controller('post')
export class PostController {
    constructor (private readonly postService: PostService){}

    @UseGuards(JwtAuthGuard)
    @HttpPost()
    create(@Req() req, @Body() dto: CreatePostDto) {
        const userId = req.user.userId;
        return this.postService.create(userId, dto);
    }

    @Get()
    findAll(@Query() query: GetPostQueryDto) {
        return this.postService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.postService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto, @Req() req) {
        const userId = req.user.userId;
        console.log(req.user);
        return this.postService.update(id, dto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
        const userId = req.user.userId;
        return this.postService.remove(id, userId);
    }
}
