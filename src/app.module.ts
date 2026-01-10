import * as crypto from 'crypto';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { User } from './database/entities/user.entity';
import { Post } from './database/entities/post.entity';
import { Comment } from './database/entities/comment.entity';
import { Like } from './database/entities/like.entity';
import { Follow } from './database/entities/follow.entity';

import { UserModule } from './modules/user/user.module'; 
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LikeModule } from './modules/like/like.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [User, Post, Comment, Like, Follow],
        synchronize: true,
      }),
    }),

    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    LikeModule,

    // ServeStaticModule 추가
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // public 폴더 위치
    }),
  ],
})
export class AppModule {}
