import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';

import { SearchQueryDto } from './dto/search-query.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { SearchPostResponseDto } from './dto/search-post.response.dto';
import { SearchResponseDto } from './dto/search.response.dto';
import { SearchUserResponseDto } from './dto/search-user.response.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResponseDto> {
    const keyword = query.keyword.trim();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const target = query.target ?? 'all';

    const response: SearchResponseDto = {};

    if (target === 'post' || target === 'all') {
      response.posts = await this.searchPosts(keyword, page, limit);
    }

    if (target === 'user' || target === 'all') {
      response.users = await this.searchUsers(keyword, page, limit);
    }

    return response;
  }

  /* =========================
     POSTS
  ========================= */

  private async searchPosts(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<PageResponseDto<SearchPostResponseDto>> {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .select(['post.id', 'post.content', 'post.createdAt'])
      .where('post.deletedAt IS NULL')
      .andWhere('post.content ILIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .orderBy('post.createdAt', 'DESC')
      .skip(this.getSkip(page, limit))
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return this.buildPageResponse(data, total, page, limit);
  }

  /* =========================
     USERS
  ========================= */

  private async searchUsers(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<PageResponseDto<SearchUserResponseDto>> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.nickname'])
      .where(
        '(user.email ILIKE :kw OR user.nickname ILIKE :kw)',
        { kw: `%${keyword}%` },
      )
      .orderBy('user.id', 'DESC')
      .skip(this.getSkip(page, limit))
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return this.buildPageResponse(data, total, page, limit);
  }

  /* =========================
     COMMON
  ========================= */

  private getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  private buildPageResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PageResponseDto<T> {
    return { data, total, page, limit };
  }
}
