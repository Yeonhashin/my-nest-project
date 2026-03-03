import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  /*
    =========================
            CREATE
    =========================
  */

  async create(
    postId: number,
    userId: number,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = this.commentRepo.create({
      content: dto.content,
      post,
      user,
    });

    return this.commentRepo.save(comment);
  }

  /*
    =========================
            UPDATE
    =========================
  */

  async update(
    commentId: number,
    userId: number,
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findCommentWithUser(commentId);

    this.validateOwner(comment, userId);

    comment.content = dto.content;

    return this.commentRepo.save(comment);
  }

  /*
    =========================
            REMOVE
    =========================
  */

  async remove(
    commentId: number,
    userId: number,
  ): Promise<{ success: boolean }> {
    const comment = await this.findCommentWithUser(commentId);

    this.validateOwner(comment, userId);

    await this.commentRepo.softRemove(comment);

    return { success: true };
  }

  /*
    =========================
        PRIVATE METHODS
    =========================
  */

  private async findCommentWithUser(commentId: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  private validateOwner(comment: Comment, userId: number): void {
    if (comment.user.id !== userId) {
      throw new ForbiddenException('You are not the owner of this comment');
    }
  }
}
