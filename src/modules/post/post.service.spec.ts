import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';
import { GetPostQueryDto } from './dto/get-post-query.dto';

describe('PostService', () => {
  let service: PostService;
  let postRepo: jest.Mocked<Repository<Post>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let commentRepo: jest.Mocked<Repository<Comment>>;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
  } as User;

  const mockPost = {
    id: 1,
    content: 'post',
    imageUrl: null,
    createdAt: new Date(),
    user: mockUser,
    comments: [],
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(PostService);
    postRepo = module.get(getRepositoryToken(Post));
    userRepo = module.get(getRepositoryToken(User));
    commentRepo = module.get(getRepositoryToken(Comment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
    =========================
            CREATE
    =========================
  */

  describe('create', () => {
    it('게시물 생성 성공', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      postRepo.create.mockReturnValue(mockPost);
      postRepo.save.mockResolvedValue(mockPost);

      const result = await service.create(1, { content: 'hello' });

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(postRepo.create).toHaveBeenCalled();
      expect(postRepo.save).toHaveBeenCalledWith(mockPost);
      expect(result.id).toBe(1);
      expect(result.user.id).toBe(1);
    });

    it('유저 없으면 NotFoundException', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(1, { content: 'hello' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /*
    =========================
            FIND ALL
    =========================
  */

  describe('findAll', () => {
    it('게시물 목록 반환', async () => {
      postRepo.find.mockResolvedValue([mockPost]);

      const result = await service.findAll({} as GetPostQueryDto);

      expect(postRepo.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].user.email).toBe('test@test.com');
    });
  });

  /*
    =========================
            FIND ONE
    =========================
  */

  describe('findOne', () => {
    it('게시물 조회 성공', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(postRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 1 }),
        }),
      );

      expect(result.id).toBe(1);
    });

    it('게시물 없으면 NotFoundException', async () => {
      postRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /*
    =========================
            UPDATE
    =========================
  */

  describe('update', () => {
    it('작성자 아니면 ForbiddenException', async () => {
      postRepo.findOne.mockResolvedValue({
        id: 1,
        user: { id: 2 },
      } as any);

      await expect(
        service.update(1, { content: 'new' }, 1),
      ).rejects.toThrow(ForbiddenException);
    });

    it('수정 성공', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);
      postRepo.save.mockResolvedValue({
        ...mockPost,
        content: 'new',
      });

      const result = await service.update(
        1,
        { content: 'new' },
        1,
      );

      expect(postRepo.save).toHaveBeenCalled();
      expect(result.content).toBe('new');
    });
  });

  /*
    =========================
            REMOVE
    =========================
  */

  describe('remove', () => {
    it('삭제 성공', async () => {
      postRepo.findOne.mockResolvedValue(mockPost);

      const result = await service.remove(1, 1);

      expect(postRepo.softRemove).toHaveBeenCalledWith(mockPost);
      expect(result).toBeUndefined();
    });

    it('게시물 없으면 NotFoundException', async () => {
      postRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자 아니면 ForbiddenException', async () => {
      postRepo.findOne.mockResolvedValue({
        id: 1,
        user: { id: 2 },
      } as any);

      await expect(service.remove(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
