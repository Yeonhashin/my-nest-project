import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment]), AuthModule],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
