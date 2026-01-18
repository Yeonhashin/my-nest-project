import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/database/entities/post.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
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
    const { keyword, target, page, limit } = query;

    const result: SearchResponseDto = {};

    if (target === 'post' || target === 'all') {
      result.posts = await this.searchPosts(keyword, page, limit);
    }

    if (target === 'user' || target === 'all') {
      result.users = await this.searchUsers(keyword, page, limit);
    }

    return result;
  }

  private async searchPosts(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<PageResponseDto<SearchPostResponseDto>> {
    const qb = this.postRepo.createQueryBuilder('post')
      .select(['post.id', 'post.content', 'post.createdAt'])
      .where('post.content ILIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  private async searchUsers(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<PageResponseDto<SearchUserResponseDto>> {
    const qb = this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.nickname'])
      .where(
        '(user.email ILIKE :kw OR user.nickname ILIKE :kw)',
        { kw: `%${keyword}%` },
      )
      .orderBy('user.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }
}

