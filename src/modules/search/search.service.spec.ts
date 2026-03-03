import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';

describe('SearchService', () => {
    let service: SearchService;
    let postRepo: jest.Mocked<Repository<Post>>;
    let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService, 
        {
          provide: getRepositoryToken(Post),
          useValue: {
            createQueryBuilder: jest.fn(),
          }
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get(SearchService);
    postRepo = module.get(getRepositoryToken(Post));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('게시글로 검색하기', async () => {
      //searchPosts
      const mockPosts = [ {id: 1, content: 'hello', createAt: new Date()}];
      const mockQB: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockPosts, 1]),
      };

      postRepo.createQueryBuilder.mockReturnValue(mockQB); 

      const result = await service.search({
        keyword: 'hello',
        target: 'post',
        page: 1,
        limit: 10,
      });

      expect(postRepo.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQB.getManyAndCount).toHaveBeenCalled();

      expect(result.posts?.data).toEqual(mockPosts);
      expect(result.posts?.total).toBe(1);
    });
  });

  describe('search', () => {
    it('유저로 검색하기', async () => {
      //searchUsers
      const mockUsers = [ {id: 1, email: 'test@test.com', nickname: 'tester'}]
      const mockQB: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 1]),
      };

      userRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.search({
        keyword: 'test',
        target: 'user',
        page: 1,
        limit: 10,
      });

      expect(userRepo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQB.getManyAndCount).toHaveBeenCalled();

      expect(result.users?.data).toEqual(mockUsers);
      expect(result.users?.total).toBe(1);
    });
  });
});
