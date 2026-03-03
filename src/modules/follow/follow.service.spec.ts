import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from './follow.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Follow } from '../../database/entities/follow.entity';
import { Repository } from 'typeorm';
import { JwtSecretRequestType } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConflictException } from '@nestjs/common';

describe('FollowService', () => {
  let followService: FollowService;
  let followRepo: jest.Mocked<Repository<Follow>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockTxFollowRepo = {
    findOne: jest.fn(),
    restore: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      FollowService,
      {
        provide: getRepositoryToken(User),
        useValue: {
          findOne: jest.fn(),
          createQueryBuilder: jest.fn(),
        },
      },
      {
        provide: getRepositoryToken(Follow),
        useValue: {
          manager: {
            transaction: jest.fn((cb) =>
              cb({
                getRepository: () => mockTxFollowRepo,
              }),
            ),
          },
        },
      },
    ],
  }).compile();

  followService = module.get(FollowService);
  userRepo = module.get(getRepositoryToken(User));
});

  it('follow - 팔로우 성공', async () => {
    userRepo.findOne.mockResolvedValue({ id: 2 } as User);
    mockTxFollowRepo.findOne.mockResolvedValue(null);
    mockTxFollowRepo.create.mockReturnValue({ id: 1 });
    mockTxFollowRepo.save.mockResolvedValue({});

    const result = await followService.follow(1, 2);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(mockTxFollowRepo.findOne).toHaveBeenCalled();
    expect(mockTxFollowRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('follow - 이미 팔로우한 경우 ConflictException', async () => {
    userRepo.findOne.mockResolvedValue({ id: 2 } as User);
    mockTxFollowRepo.findOne.mockResolvedValue({
      id: 1,
      deletedAt: null,
    });

    await expect(
      followService.follow(1, 2),
    ).rejects.toThrow(ConflictException);
  });

  it('unfollow - 언팔로우 성공', async () => {
    userRepo.findOne.mockResolvedValue({ id: 2 } as User);
    mockTxFollowRepo.findOne.mockResolvedValue({
      id: 1,
      deletedAt: null,
    });

    await followService.unfollow(1, 2);

    expect(mockTxFollowRepo.softDelete).toHaveBeenCalledWith(1);
  });

  it('getFollowings - 팔로잉 리스트', async () => {
    const users = [{ id: 1, email: 'a@test.com' }];
    const mockQB = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(users),
    };

    userRepo.createQueryBuilder.mockReturnValue(mockQB as any);

    const result = await followService.getFollowings(1);

    expect(result).toEqual(users);
  });

  it('getFollowers - 팔로워 리스트 취득', async () => {
    const users = [{ id: 1, email: 'a@test.com' }];
    const mockQB = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(users),
    };

    userRepo.createQueryBuilder.mockReturnValue(mockQB as any);

    const result = await followService.getFollowers(1);

    expect(result).toEqual(users);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

});
