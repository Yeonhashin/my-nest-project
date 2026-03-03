import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Like } from '../../database/entities/like.entity';
import { Post } from '../../database/entities/post.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  /*
    =========================
            LIKE
    =========================
  */

  async likePost(
    userId: number,
    postId: number,
  ): Promise<{ success: boolean }> {
    const post = await this.findPostWithUser(postId);

    this.validateNotOwner(post.user.id, userId);

    const existingLike = await this.findLikeWithDeleted(userId, postId);

    if (existingLike) {
      return this.handleExistingLike(existingLike);
    }

    await this.createLike(userId, postId);

    return { success: true };
  }

  /*
    =========================
            UNLIKE
    =========================
  */

  async unlikePost(
    userId: number,
    postId: number,
  ): Promise<{ success: boolean }> {
    const like = await this.likeRepo.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
        deletedAt: IsNull(),
      },
    });

    if (!like) {
      throw new NotFoundException('좋아요 내역이 없습니다.');
    }

    await this.likeRepo.softDelete(like.id);

    return { success: true };
  }

  /*
    =========================
        PRIVATE METHODS
    =========================
  */

  private async findPostWithUser(postId: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('게시물이 존재하지 않습니다.');
    }

    return post;
  }

  private validateNotOwner(postOwnerId: number, userId: number): void {
    if (postOwnerId === userId) {
      throw new ForbiddenException(
        '내가 쓴 글에는 좋아요를 할 수 없습니다.',
      );
    }
  }

  private async findLikeWithDeleted(
    userId: number,
    postId: number,
  ): Promise<Like | null> {
    return this.likeRepo.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
      withDeleted: true,
    });
  }

  private async handleExistingLike(
    like: Like,
  ): Promise<{ success: boolean }> {
    if (like.deletedAt === null) {
      throw new ConflictException('이미 좋아요한 게시글입니다.');
    }

    await this.likeRepo.restore(like.id);

    return { success: true };
  }

  private async createLike(
    userId: number,
    postId: number,
  ): Promise<void> {
    const like = this.likeRepo.create({
      post: { id: postId },
      user: { id: userId },
    });

    try {
      await this.likeRepo.save(like);
    } catch {
      // unique 제약조건 대비
      throw new ConflictException('이미 좋아요한 게시글입니다.');
    }
  }
}
