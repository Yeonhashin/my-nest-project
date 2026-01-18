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
import { LikeModule } from './modules/like/like.module';
import { FollowModule } from './modules/follow/follow.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest = config.get('NODE_ENV') === 'test';

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<number>('DB_PORT')),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),

          entities: [User, Post, Comment, Like, Follow],

          synchronize: isTest,
          dropSchema: isTest,
          logging: isTest,
        };
      },
    }),

    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    LikeModule,
    FollowModule,

    // ServeStaticModule 추가
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), 
    }),

    SearchModule,
  ],
})
export class AppModule {}
