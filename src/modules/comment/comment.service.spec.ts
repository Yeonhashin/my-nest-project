import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { Comment } from '../../database/entities/comment.entity';
import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepo: jest.Mocked<Repository<Comment>>;
  let postRepo: jest.Mocked<Repository<Post>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CommentService);
    commentRepo = module.get(getRepositoryToken(Comment));
    postRepo = module.get(getRepositoryToken(Post));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
    ========================
            CREATE
    ========================
  */

  describe('create', () => {
    const mockPost = { id: 1 } as Post;
    const mockUser = { id: 1 } as User;
    const mockComment = { id: 1 } as Comment;

    it('코멘트 작성 성공', async () => {
      postRepo.findOneBy.mockResolvedValue(mockPost);
      userRepo.findOneBy.mockResolvedValue(mockUser);
      commentRepo.create.mockReturnValue(mockComment);
      commentRepo.save.mockResolvedValue(mockComment);

      const result = await service.create(1, 1, {
        content: '댓글 내용',
      });

      expect(postRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(commentRepo.create).toHaveBeenCalled();
      expect(commentRepo.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual(mockComment);
    });

    it('게시물이 존재하지 않으면 NotFoundException', async () => {
      postRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create(1, 1, { content: '댓글' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('유저가 존재하지 않으면 NotFoundException', async () => {
      postRepo.findOneBy.mockResolvedValue(mockPost);
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create(1, 1, { content: '댓글' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /*
    ========================
            UPDATE
    ========================
  */

  describe('update', () => {
    const existingComment = {
      id: 1,
      content: 'old',
      user: { id: 1 },
    } as any;

    it('댓글 수정 성공', async () => {
      commentRepo.findOne.mockResolvedValue(existingComment);
      commentRepo.save.mockResolvedValue({ ...existingComment, content: 'new' });

      const result = await service.update(1, 1, {
        content: 'new',
      });

      expect(commentRepo.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...existingComment,
        content: 'new',
      });
    });

    it('댓글이 존재하지 않으면 NotFoundException', async () => {
      commentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, 1, { content: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('작성자가 다르면 ForbiddenException', async () => {
      commentRepo.findOne.mockResolvedValue({
        id: 1,
        user: { id: 2 },
      } as any);

      await expect(
        service.update(1, 1, { content: 'new' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /*
    ========================
            REMOVE
    ========================
  */

  describe('remove', () => {
    const existingComment = {
      id: 1,
      user: { id: 1 },
    } as any;

    it('댓글 삭제 성공', async () => {
      commentRepo.findOne.mockResolvedValue(existingComment);
      commentRepo.softRemove.mockResolvedValue(existingComment);

      const result = await service.remove(1, 1);

      expect(commentRepo.softRemove).toHaveBeenCalledWith(existingComment);
      expect(result).toEqual({ success: true });
    });

    it('댓글이 존재하지 않으면 NotFoundException', async () => {
      commentRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자가 다르면 ForbiddenException', async () => {
      commentRepo.findOne.mockResolvedValue({
        id: 1,
        user: { id: 2 },
      } as any);

      await expect(service.remove(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
