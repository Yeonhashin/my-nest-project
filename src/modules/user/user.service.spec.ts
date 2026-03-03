import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const hashedPassword =
    '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Y3Gz5x1ZJ8p2UeZ1p2UeZ1p2UeZ1p';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserService);
    userRepo = module.get(getRepositoryToken(User));

    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     REGISTER
  ========================= */

  describe('register', () => {
    it('회원가입 성공', async () => {
      userRepo.create.mockReturnValue({
        email: 'test@test.com',
        password: hashedPassword,
        nickname: 'tester',
      } as User);

      userRepo.save.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        nickname: 'tester',
      } as User);

      const result = await service.register({
        email: 'test@test.com',
        password: '1234',
        nickname: 'tester',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalled();

      expect(result).toEqual({
        id: 1,
        email: 'test@test.com',
        nickname: 'tester',
      });
    });

    it('이메일 중복이면 BadRequestException', async () => {
      userRepo.create.mockReturnValue({} as User);
      userRepo.save.mockRejectedValue({ code: '23505' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: '1234',
          nickname: 'tester',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('기타 DB 에러면 InternalServerErrorException', async () => {
      userRepo.create.mockReturnValue({} as User);
      userRepo.save.mockRejectedValue(new Error('db error'));

      await expect(
        service.register({
          email: 'test@test.com',
          password: '1234',
          nickname: 'tester',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  /* =========================
     FIND
  ========================= */

  describe('findByEmail', () => {
    it('이메일로 유저 조회 성공', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      } as User);

      const user = await service.findByEmail('test@test.com');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });

      expect(user?.email).toBe('test@test.com');
    });
  });

  describe('findMe', () => {
    it('내 정보 조회 성공', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        nickname: 'tester',
      } as User);

      const user = await service.findMe(1);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'email', 'nickname', 'createdAt'],
      });

      expect(user.id).toBe(1);
    });

    it('유저 없으면 NotFoundException', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.findMe(1)).rejects.toThrow(NotFoundException);
    });
  });

  /* =========================
     UPDATE
  ========================= */

  describe('updateMe', () => {
    it('업데이트 필드 없으면 BadRequestException', async () => {
      await expect(service.updateMe(1, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nickname 수정 성공', async () => {
      await service.updateMe(1, { nickname: 'newNick' });

      expect(userRepo.update).toHaveBeenCalledWith(1, {
        nickname: 'newNick',
      });
    });

    it('password 수정 시 해싱 수행', async () => {
      await service.updateMe(1, { password: '1234' });

      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(userRepo.update).toHaveBeenCalledWith(1, {
        password: hashedPassword,
      });
    });
  });
});
