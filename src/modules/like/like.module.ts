import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../database/entities/post.entity';
import { Like } from '../../database/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Post]),
  ],
  controllers: [LikeController],
  providers: [LikeService]
})
export class LikeModule {}
