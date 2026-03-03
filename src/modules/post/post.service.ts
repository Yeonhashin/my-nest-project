import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';

import { CreatePostDto } from './dto/create-post.dto';
import { GetPostQueryDto } from './dto/get-post-query.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  /* =========================
     CREATE
  ========================= */

  async create(userId: number, dto: CreatePostDto): Promise<PostResponseDto> {
    const user = await this.findUserOrFail(userId);

    const post = this.postRepo.create({
      content: dto.content,
      imageUrl: dto.imageUrl,
      user,
    });

    const saved = await this.postRepo.save(post);
    return this.toPostResponse(saved);
  }

  /* =========================
     READ - LIST
  ========================= */

  async findAll(query: GetPostQueryDto): Promise<PostResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const posts = await this.postRepo.find({
      where: { deletedAt: IsNull() },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map(this.toPostResponse);
  }

  /* =========================
     READ - DETAIL
  ========================= */

  async findOne(postId: number) {
    const post = await this.postRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
      relations: ['user', 'comments', 'comments.user'],
      order: {
        comments: { createdAt: 'ASC' },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...this.toPostResponse(post),
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          email: comment.user.email,
        },
      })),
    };
  }

  /* =========================
     UPDATE
  ========================= */

  async update(
    postId: number,
    dto: UpdatePostDto,
    userId: number,
  ): Promise<PostResponseDto> {
    const post = await this.getPostWithPermission(postId, userId);

    if (dto.content !== undefined) {
      post.content = dto.content;
    }

    if (dto.imageUrl !== undefined) {
      post.imageUrl = dto.imageUrl ?? undefined;
    }

    const updated = await this.postRepo.save(post);
    return this.toPostResponse(updated);
  }

  /* =========================
     DELETE (Soft)
  ========================= */

  async remove(postId: number, userId: number): Promise<void> {
    const post = await this.getPostWithPermission(postId, userId);
    await this.postRepo.softRemove(post);
  }

  /* =========================
     PRIVATE METHODS
  ========================= */

  private async findUserOrFail(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async getPostWithPermission(
    postId: number,
    userId: number,
  ): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
      relations: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('No permission');
    }

    return post;
  }

  private toPostResponse(post: Post): PostResponseDto {
    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl ?? null,
      createdAt: post.createdAt,
      user: {
        id: post.user.id,
        email: post.user.email,
      },
    };
  }
}
