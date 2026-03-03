import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from './like.service';
import { Repository } from 'typeorm';
import { Like } from '../../database/entities/like.entity';
import { Post } from '../../database/entities/post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('LikeService', () => {
  let service: LikeService;
  let likeRepo: jest.Mocked<Repository<Like>>;
  let postRepo: jest.Mocked<Repository<Post>>;

  const mockPost = {
    id: 1,
    user: { id: 999 },
  } as any;

  const mockLike = {
    id: 1,
    post: { id: 1 },
    user: { id: 1 },
    deletedAt: null,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: getRepositoryToken(Like),
          useValue: {
            findOne: jest.fn(),
            restore: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(LikeService);
    likeRepo = module.get(getRepositoryToken(Like));
    postRepo = module.get(getRepositoryToken(Post));

    // 기본 게시글 mock
    postRepo.findOne.mockResolvedValue(mockPost);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
    =========================
            LIKE
    =========================
  */

  describe('likePost', () => {
    it('최초 좋아요 성공', async () => {
      likeRepo.findOne.mockResolvedValue(null);
      likeRepo.create.mockReturnValue(mockLike);
      likeRepo.save.mockResolvedValue(mockLike);

      const result = await service.likePost(1, 1);

      expect(postRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });

      expect(likeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          post: expect.objectContaining({ id: 1 }),
          user: expect.objectContaining({ id: 1 }),
        }),
      );

      expect(likeRepo.save).toHaveBeenCalledWith(mockLike);
      expect(result).toEqual({ success: true });
    });

    it('게시글이 없으면 NotFoundException', async () => {
      postRepo.findOne.mockResolvedValue(null);

      await expect(service.likePost(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('내가 작성한 글이면 ForbiddenException', async () => {
      postRepo.findOne.mockResolvedValue({
        id: 1,
        user: { id: 1 },
      } as any);

      await expect(service.likePost(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('이미 좋아요 상태면 ConflictException', async () => {
      likeRepo.findOne.mockResolvedValue(mockLike);

      await expect(service.likePost(1, 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('soft delete 상태면 restore 호출', async () => {
      likeRepo.findOne.mockResolvedValue({
        ...mockLike,
        deletedAt: new Date(),
      });

      await service.likePost(1, 1);

      expect(likeRepo.restore).toHaveBeenCalledWith(1);
    });

    it('save 실패 시 ConflictException', async () => {
      likeRepo.findOne.mockResolvedValue(null);
      likeRepo.create.mockReturnValue(mockLike);
      likeRepo.save.mockRejectedValue(new Error());

      await expect(service.likePost(1, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  /*
    =========================
            UNLIKE
    =========================
  */

  describe('unlikePost', () => {
    it('좋아요 취소 성공', async () => {
      likeRepo.findOne.mockResolvedValue(mockLike);

      const result = await service.unlikePost(1, 1);

      expect(likeRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });

    it('좋아요 내역이 없으면 NotFoundException', async () => {
      likeRepo.findOne.mockResolvedValue(null);

      await expect(service.unlikePost(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
