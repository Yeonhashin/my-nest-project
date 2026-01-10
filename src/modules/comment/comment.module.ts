import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment]), AuthModule],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
